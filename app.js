const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

const dbConnectAtlas = 'mongodb+srv://admin-gerson:456test123@cluster0.tscv4.mongodb.net/todoListDB'

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB", {
//   useNewUrlParser: true
// });

mongoose.connect(dbConnectAtlas)

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: 'Study mongoDB'
})
const item2 = new Item({
  name: 'Matulog na hapit ka duka na'
})
const item3 = new Item({
  name: 'Natulog nas'
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {

  Item.find({}, (err, foundItems) => {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        err ?
          console.log(err) :
          console.log("Inserted document successfully.");
      });
      res.redirect("/");
    } else {
      err ?
        console.log(err) :
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });
    }
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName)
      } else {
        // Show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });

      }
    }
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list.trim();

 const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect(`${listName}`)       
     })
  }

});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findOneAndRemove({_id: checkedItemId}, (err, deleted)=> {
      if (!err) {
        console.log(`${deleted.name} has been deleted.`);
      } else{
        console.log(err);
      }
    });
    res.redirect("/");
  }else{

    List.findOneAndUpdate(
      {name:listName }, 
      {$pull:{items:{_id:checkedItemId}}}, 
      (err, foundList) =>{
            if(!err){
              res.redirect(`/${listName}`)
            }
    });

  }

  
});



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});