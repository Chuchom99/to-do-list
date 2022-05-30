const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
// const https = require('https');
const date = require(__dirname + '/date.js');

const app = express();
// const items = [];
// const workItem = [];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://chuchom99:Twiste11@cluster0.mfaxh.mongodb.net/todolistDB', {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "work"
});
const item2 = new Item({
  name: "rice"
});
const item3 = new Item({
  name: "football"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, function(err){
//   if (err){
//   console.log(err);}else {
//     console.log("successfull");
//   }
// });

app.get("/", function(req, res) {
  // res.sendFile(__dirname + "");
  // const day = date.getDate();
  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("code successfull");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitile: "Today",
        newListItems: foundItems
      });
    }
  });

});

app.get("/:customToDoList", function(req, res) {
  const customToDoList = _.capitalize(req.params.customToDoList);


  List.findOne({name: customToDoList}, function(err, foundList){
    if (!err) {
      if (!foundList){
        const list = new List({
          name: customToDoList,
          items: defaultItems
        });
        list.save();
      }else {
        res.render("list", {listTitile: foundList.name, newListItems: foundList.items})
      }
    }
  });
});


app.get("/about", function(req, res) {
  res.render("about");
});
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })

  }
});


app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}},function(err, foundList){
      if (!err){
        res.redirect("/" + listName );
      }
    });
  }
});

// app.get("/:itemId", function(req, res) {
//   const itemID = req.params.itemId;
//
//   List.findOne({
//     name: itemID
//   }, function(err, foundList) {
//     if (!err) {
//       if (!foundList) {
//         const list = new Item({
//           name: itemID,
//           items: defaultItems
//         });
//         list.save();
//
//       } else {
//         res.render("list", {
//           listTitile: foundList.name,
//           newListItems: foundList.item
//         });
//       }
//     }
//
//
//   });
//
//
// });



// app.post("/work", function(req, res){
//   let item = req.body.newItem;
//   workItem.push(item);
//   res.redirect("/work")
//
// });

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }
// app.listen(port);
//
//
// app.listen(port, function() {
//   console.log("server has started successfully");
// })

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
