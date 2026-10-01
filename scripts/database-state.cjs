function tableCounts(db) {
  return Promise.all([db.user.count(), db.subreddit.count(), db.post.count(), db.vote.count(), db.comment.count()]);
}

async function requireRls(db) {
  const tables = await db.$queryRaw`SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('User', 'Subreddit', 'Post', 'Vote', 'Comment')`;
  if (tables.length !== 5 || tables.some((table) => !table.rowsecurity)) {
    throw new Error("All five application tables must have RLS enabled.");
  }
}

module.exports = { tableCounts, requireRls };
