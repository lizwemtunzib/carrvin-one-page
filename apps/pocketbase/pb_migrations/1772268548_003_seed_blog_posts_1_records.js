/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("blog_posts");

  const record0 = new Record(collection);
    record0.set("title", "Getting Started with Our Platform");
    record0.set("slug", "getting-started");
    record0.set("content", "Welcome to our platform...");
    record0.set("excerpt", "Learn the basics");
    record0.set("author", "Admin");
    record0.set("published", true);
    record0.set("category", "Getting Started");
    record0.set("view_count", 0);
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})