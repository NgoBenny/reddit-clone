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
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const { getVoteSummary } = load("app/lib/votes.ts");
  const sampleVotes = [{ userId: "owner", voteType: "UP" }, { userId: "other", voteType: "DOWN" }];
  assert.equal(getVoteSummary(sampleVotes, "owner").voteCount, 0);
  assert.equal(getVoteSummary(sampleVotes, "owner").currentVote, "UP");
  assert.equal(getVoteSummary(sampleVotes).currentVote, undefined);
  assert.equal(getVoteSummary([]).voteCount, 0);
  let pending = false;
  const buttons = load("app/components/SubmitButtons.tsx", {
    "@/components/ui/button": { Button: (props) => React.createElement("button", props) },
    "@/lib/utils": { cn: (...values) => values.filter(Boolean).join(" ") },
    "react-dom": { useFormStatus: () => ({ pending }) },
  });
  for (const direction of ["UP", "DOWN"]) {
    const html = renderToStaticMarkup(React.createElement(buttons.VoteButton, { direction, active: true }));
    assert.match(html, new RegExp(`aria-label="${direction.toLowerCase()}vote"`));
    assert.match(html, /aria-pressed="true"/);
    assert.match(html, direction === "UP" ? /fill-red-500/ : /fill-blue-500/);
  }
  pending = true;
  assert.match(renderToStaticMarkup(React.createElement(buttons.VoteButton, { direction: "UP" })), /disabled/);
  assert.match(renderToStaticMarkup(React.createElement(buttons.SubmitButton, { text: "Save" })), /Please wait/);
  const { VoteControls } = load("app/components/VoteControls.tsx", {
    "../actions": { handleVote: "/vote" }, "./SubmitButtons": buttons,
  });
  const controls = renderToStaticMarkup(React.createElement(VoteControls, { postId: "post-123", voteCount: 5, currentVote: "UP", className: "votes" }));
  assert.equal((controls.match(/name="postId" value="post-123"/g) || []).length, 2);
  assert.match(controls, /name="voteDirection" value="UP"/);
  assert.match(controls, /name="voteDirection" value="DOWN"/);
  assert.match(controls, /<\/form>5<form/);
  const notifications = [];
  const { useActionToast } = load("app/components/useActionToast.ts", {
    react: { useEffect: (effect) => effect() },
    "@/components/ui/use-toast": { useToast: () => ({ toast: (notice) => notifications.push(notice) }) },
  });
  for (const status of ["", "green", "error"]) useActionToast({ status, message: "test" });
  assert.equal(notifications.length, 2);
  assert.equal(notifications[0].title, "Success");
  assert.equal(notifications[1].variant, "destructive");
  let commentError;
  let commentResets = 0;
  const { CommentForm } = load("app/components/CommentForm.tsx", {
    react: { ...React, useRef: () => ({ current: { reset: () => commentResets++ } }) },
    "@/components/ui/label": { Label: "label" }, "@/components/ui/textarea": { Textarea: "textarea" },
    "./SubmitButtons": buttons,
    "../actions": { createComment: async () => { if (commentError) throw commentError; } },
    "@/components/ui/use-toast": { useToast: () => ({ toast: (notice) => notifications.push(notice) }) },
  });
  const commentAction = CommentForm({ postId: "post" }).props.action;
  await commentAction(new FormData());
  assert.equal(commentResets, 1);
  commentError = (() => { try { require("next/navigation").redirect("/api/auth/login"); } catch (error) { return error; } })();
  await assert.rejects(() => commentAction(new FormData()), (error) => error === commentError);
  assert.equal(notifications.length, 2);
  commentError = new Error("Database unavailable");
  await commentAction(new FormData());
  assert.equal(notifications.length, 3);
  assert.equal(commentResets, 1, "Failed comments must preserve the draft");
  // Exercise the actual composer handler: redirects must not show failure toasts.
  const source = ts.createSourceFile("composer.tsx", fs.readFileSync("app/r/[id]/create/page.tsx", "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let handler;
  function findHandler(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === "createPostReddit") handler = node.getText(source);
    ts.forEachChild(node, findHandler);
  }
  findHandler(source);
  assert.ok(handler);
  let notices = 0;
  const { unstable_rethrow, redirect } = require("next/navigation");
  const successRedirect = (() => { try { redirect("/post/test"); } catch (error) { return error; } })();
  const composer = vm.runInNewContext(ts.transpileModule(`(${handler})`, {}).outputText, {
    createPost: async () => { throw successRedirect; },
    unstable_rethrow,
    toast: () => notices++,
    json: null,
  });
  await assert.rejects(() => composer(new FormData()), error => error === successRedirect);
  assert.equal(notices, 0);
  const failedComposer = vm.runInNewContext(ts.transpileModule(`(${handler})`, {}).outputText, {
    createPost: async () => { throw new Error("Database unavailable"); },
    unstable_rethrow,
    toast: () => notices++,
    json: null,
  });
  await failedComposer(new FormData());
  assert.equal(notices, 1);
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
  const beforeUnauthenticated = writes;
  for (const attempt of [
    () => vote("UP"),
    () => actions.updateUsername({}, form({})),
    () => actions.createCommunity({}, form({})),
    () => actions.updateSubDescription({}, form({})),
    () => actions.createPost({ jsonContent: null }, form({})),
    () => actions.createComment(form({})),
  ]) await assert.rejects(attempt, /REDIRECT:\/api\/auth\/login/);
  assert.equal(writes, beforeUnauthenticated);
  console.log(
    "Regression checks passed: validation, safe rich text, ownership, vote toggle/repair/retry, and authentication.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
