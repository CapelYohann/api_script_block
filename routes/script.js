const express = require('express');
const bodyParser = require('body-parser');
const controllers = require('../controllers');
const jwt = require('../utils/jwt.utils');
const ModelIndex = require('../models');
const ScriptController = controllers.ScriptController;

const scriptRouter = express.Router();
scriptRouter.use(bodyParser.json());

scriptRouter.post('/add', jwt.checkToken, function(req, res) {
  const name = req.body[0].name;
  const description = req.body[0].description;
  const size = req.body[0].size;
  const id_user = req.id_user;
  
  if(name === undefined) {
    res.status(400).json({ "error": "You have to set a name to the script" });
    return;
  }
  if(description === undefined) {
    description = "";
  }
  if(size === undefined) {
    res.status(400).end();
    return;
  }
  if(id_user === undefined) {
    res.status(400).json({ "error": "You have to be connected to send a script" });
    return;
  }
  
  ScriptController.add(name, description, size, id_user)
  .then((p) => {
    res.status(201).json([p]);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ "error": "Can't upload the script"});
  });
});

scriptRouter.get("/getCheckReports", jwt.checkToken, function(req, res) {
  const id_user = req.id_user;
  ScriptController.findAll()
  .then((scripts) => {
    controllers.ReportController.findByUser(id_user)
    .then((reports) => {
      for(var i = 0; i < scripts.length; i++) {
        scripts[i] = scripts[i].toJSON();
        for(var j = 0; j < reports.length; j++) {
//          reports[j] = reports[j].toJSON();
          if(scripts[i].id === reports[j].id_script) {
            scripts[i].reported = true;
          }
        }
      }
      res.status(200).json(scripts);
    })
  })
});

scriptRouter.get('/', function(req, res) {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
  ScriptController.findAll(req.query.id, req.query.name, req.query.description, req.query.category, req.query.size, req.query.downloads_count, req.query.date_crea, req.query.id_user, req.query.available, limit, offset)
  .then((scripts) => {
    res.json(scripts);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).end();
  });
});

scriptRouter.delete('/remove/:id', jwt.checkToken, function(req, res) {
  const id = parseInt(req.params.id);
  
  if(id === undefined) {
    req.status(400).end();
  }
  
  ScriptController.remove(id)
  .then((p) => {
    res.status(200).json(p);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).end();
  });
})

scriptRouter.put('/updateDLC/:id', function(req, res) {
  const id = req.params.id;
  if(id === undefined) {
    return res.status(400).end();
  }
  
  ModelIndex.Script.findOne({where:{id:id}})
  .then((script) => {
    ScriptController.updateDLC(script, id, script.downloads_count)
    .then((sc) => {
      res.status(200).json({ 'download_count': sc.downloads_count })
    })
    .catch((err) => {
      res.status(500).json({ 'error': "can't update download count" })
    });
  })
  .catch((err) => {
    console.log(err)
    res.status(404).json({ 'error': 'script not found' });
  })
});

scriptRouter.post('/update', jwt.checkToken, function(req, res) {
  const id = req.body.id;
  const description = req.body.description;
  const category = req.body.category;
  const dl_count = req.body.downloads_count;
  const available = req.body.available;
  
  if(id === undefined) {
    res.status(400).json({ "error": "ubyiuhoij" });
    return;
  }
  
  ScriptController.update(id, description, category, dl_count, available)
  .then((p) => {
    res.status(200).json(p);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).end();
  });
});

scriptRouter.post('/addComment', jwt.checkToken, function(req, res) {
	const id_user = req.id_user;
	const id_script = req.body.id_script;
	const comment = req.body.comment;
	
	if(id_user === undefined || id_script === undefined || comment === undefined) {
		res.status(400).json();
	}
	
	ScriptController.addComment(id_user, id_script, comment)
	.then((cmt) => {
		res.status(201).json(cmt);
	})
	.catch((err) => {
		res.status(500).json({ 'error': 'Error adding the comment' });
	})
});

scriptRouter.get('/getComments/:id_script', function(req, res) {
	const id_script = req.params.id_script;
	if(id_script === undefined) {
		res.status(400).end();
	}
	
	ScriptController.getComments(id_script)
	.then((cmt) => {
		res.status(200).json(cmt);
	})
	.catch((err) => {
		res.status(500).json({ 'error': 'Error getting comments' });
	})
});
module.exports = scriptRouter;
