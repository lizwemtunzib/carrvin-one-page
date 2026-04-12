/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pdf_downloads");

  const existing = collection.fields.getByName("token");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("token"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "token",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pdf_downloads");
  collection.fields.removeByName("token");
  return app.save(collection);
})
