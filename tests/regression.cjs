const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const { Prisma } = require("@prisma/client");

// Load the real server actions with only external services replaced.
function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    exports: module.exports,
    module,
    require: (name) => (name in mocks ? mocks[name] : require(name)),
    console,
    URL,
  });
  return module.exports;
}
const validation = load("app/lib/validation.ts");
const form = (values) => {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
};

async function main() {
  for (const value of [
    undefined,
    "",
    "0",
    "-1",
    "1.5",
    "NaN",
    "Infinity",
    "100001",
    ["2"],
  ])
    assert.equal(validation.pageNumber(value), 1);
  assert.equal(validation.pageNumber("3"), 3);
  assert.equal(validation.validName("test_community"), true);
  assert.equal(validation.validName("../create"), false);
  assert.equal(validation.validImage("https://utfs.io/f/image.png"), true);
  assert.equal(
    validation.validImage("https://utfs.io.evil.test/f/image.png"),
    false,
  );
  assert.throws(() =>
    validation.formText(form({ comment: "  " }), "comment", 5000),
  );
  assert.throws(() =>
    validation.formText(form({ title: "x".repeat(301) }), "title", 300),
  );
  const doc = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2, onclick: "alert(1)" },
        content: [
          {
            type: "text",
            text: "<script>bad</script>",
            marks: [{ type: "bold" }],
          },
        ],
      },
    ],
  };
  assert.equal(validation.validRichText(doc), true);
  assert.equal(
    validation.validRichText({ type: "doc", content: "invalid" }),
    false,
  );
  assert.equal(validation.validRichText({ type: "script" }), false);
  assert.equal(
    validation.validRichText({
      type: "text",
      text: "x",
      marks: [{ type: "constructor" }],
    }),
    false,
  );
  let deep = { type: "text", text: "x" };
  for (let i = 0; i < 22; i++) deep = { type: "doc", content: [deep] };
  assert.equal(validation.validRichText(deep), false);
  const { RenderToJson } = load("app/components/RendertoJson.tsx", {
    "../lib/validation": validation,
  });
  const html = require("react-dom/server").renderToStaticMarkup(
    require("react").createElement(RenderToJson, { data: doc }),
  );
  assert.match(html, /<h2><strong>&lt;script&gt;/);
  assert.ok(!html.includes("onclick"));
  assert.equal(RenderToJson({ data: null }), null);

  let user = { id: "owner" },
    votes = [],
    writes = 0,
    failures = 0;
  const invalidations = [];
  const prisma = {
    subreddit: {
      updateMany: async ({ where }) => {
        assert.equal(where.userId, user.id);
        if (where.userId === "owner") {
          writes++;
          return { count: 1 };
        }
        return { count: 0 };
      },
    },
    post: {
      create: async () => {
        writes++;
        return { id: "post" };
      },
    },
    comment: {
      create: async () => {
        writes++;
      },
    },
    vote: {
      findFirst: async ({ where }) =>
        votes.find(
          (vote) =>
            vote.postId === where.postId && vote.userId === where.userId,
        ),
      deleteMany: async ({ where }) => {
        votes = votes.filter(
          (vote) =>
            vote.postId !== where.postId || vote.userId !== where.userId,
        );
      },
      create: async ({ data }) => {
        votes.push(data);
      },
    },
    $transaction: async (fn, options) => {
      assert.equal(options.isolationLevel, "Serializable");
      if (failures-- > 0)
        throw new Prisma.PrismaClientKnownRequestError("conflict", {
          code: "P2034",
          clientVersion: "5.13.0",
        });
      return fn(prisma);
    },
  };
  const actions = load("app/actions.ts", {
    "./lib/validation": validation,
    "./lib/db": { __esModule: true, default: prisma },
    "@kinde-oss/kinde-auth-nextjs/server": {
      getKindeServerSession: () => ({ getUser: async () => user }),
    },
    "next/navigation": {
      redirect: (url) => {
        throw new Error(`REDIRECT:${url}`);
      },
    },
    "next/cache": { revalidatePath: (...args) => invalidations.push(args) },
  });
  user = { id: "intruder" };
  assert.equal(
    (
      await actions.updateSubDescription(
        {},
        form({ subName: "test", description: "changed" }),
      )
    ).status,
    "error",
  );
  assert.equal(writes, 0);
  user = { id: "owner" };
  assert.equal(
    (
      await actions.updateSubDescription(
        {},
        form({ subName: "test", description: "changed" }),
      )
    ).status,
    "green",
  );
  const vote = (voteDirection) =>
    actions.handleVote(form({ postId: "post", voteDirection }));
  votes = [{ postId: "other", userId: "owner", voteType: "UP" }];
  await vote("UP");
  assert.equal(votes.length, 2);
  await vote("DOWN");
  assert.equal(votes.find((v) => v.postId === "post").voteType, "DOWN");
  await vote("DOWN");
  assert.equal(votes.length, 1);
  failures = 1;
  await vote("UP");
  assert.equal(votes.length, 2);
  votes.push({ postId: "post", userId: "owner", voteType: "UP" });
  await vote("DOWN");
  assert.equal(votes.length, 2);
  assert.deepEqual(invalidations.at(-1), ["/", "layout"]);
  await assert.rejects(() => vote("INVALID"), /Invalid vote direction/);
  await assert.rejects(
    () => actions.createComment(form({ postId: "post", comment: "  " })),
    /Invalid comment/,
  );
  await assert.rejects(
    () =>
      actions.createPost(
        { jsonContent: null },
        form({
          title: "x",
          subName: "test",
          imageUrl: "https://evil.test/image",
        }),
      ),
    /Invalid image URL/,
  );
  await assert.rejects(
    () =>
      actions.createPost(
        { jsonContent: { type: "doc", content: "broken" } },
        form({ title: "x", subName: "test" }),
      ),
    /Invalid or oversized/,
  );
  user = null;
  await assert.rejects(() => vote("UP"), /REDIRECT:\/api\/auth\/login/);
  console.log(
    "Regression checks passed: validation, safe rich text, ownership, vote toggle/repair/retry, and authentication.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
