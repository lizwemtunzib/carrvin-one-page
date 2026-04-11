/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pdf_downloads");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "";
  collection.updateRule = "";
  collection.deleteRule = "@request.auth.id != \"\"";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pdf_downloads");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "";
  collection.updateRule = "";
  collection.deleteRule = "@request.auth.id != \"\"";
  return app.save(collection);
})