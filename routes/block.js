const express = require('express');
const bodyParser = require('body-parser');
var request = require('request')
const controllers = require('../controllers');
const XMLWriter = require('xml-writer');
const BlockController = controllers.BlockController;

const blockRouter = express.Router();
blockRouter.use(bodyParser.json());

blockRouter.post('/add', function(req, res) {
  const name = req.body.name;
  const description = req.body.description;
  
  if(name === undefined) {
    res.status(400).end();
    return;
  }
  if(content === undefined) {
    description = "";
  }
  
  BlockController.add(name, description)
  .then((p) => {
    res.status(201).json(p);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).end();
  });
});

blockRouter.get('/full', function(req, res) {	
	BlockController.getFullBlocks(req.query.id)
	.then((blocks) => {
		res.status(200).json(blocks);
	})
	.catch((err) => {
		res.status(500).end();
	})
});

blockRouter.get('/infos/:id', function(req, res) {
	const id = req.params.id;
	
	if(id === undefined) {
		req.status(400).end();
		return;
	}
	
	BlockController.getBlockInfos(id)
	.then((p) => {
		res.status(200).json(p);
	})
	.catch((err) => {
		console.log(err);
		res.status(500).end();
	})
});

blockRouter.get('/', function(req, res) {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
  BlockController.getAll(req.query.id, req.query.name, req.query.description, limit, offset)
  .then((blocks) => {
    res.status(200).json(blocks);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).end();
  });
});

blockRouter.put('/disable/:id', function(req, res) {
	const id =  req.params.id;
	if(isNan(parseInt(id, 10))) {
		res.status(404).end();
		return;
	}
	
	BlockController.update(id, undefined, undefined, 0)
	.then((p) => {
		res.status(200).json(p);
	})
	.catch((err) => {
		console.log(err);
		res.status(500).end();
	});
});

blockRouter.put('/enable/:id', function(req, res) {
	const id =  req.params.id;
	BlockController.update(id, undefined, undefined, 1)
	.then((p) => {
		res.status(200).json(p);
	})
	.catch((err) => {
		console.log(err);
		res.status(500).end();
	});
});

blockRouter.put('/update', function(req, res) {
  const id = req.body.id;
  const name = req.body.name;
  const description = req.body.description;
  const available = req.body.available;
  
	console.log(name);
	console.log(description);
	console.log(available);
	
  if(id === undefined) {
    res.status(404).end();
    return;
  }
  
  BlockController.update(id, name, description, available)
  .then((p) => {
    res.status(201).json(p);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).end();
  });
});

// --------------
function loop_on_block(el, xw) {
  xw.startElement(el['title']);
  for(var p in el) {
    if(el.hasOwnProperty(p)) {
      xw.writeAttribute("a", "aa");
    }
  }
  xw.endElement();
  console.log(el)
}

blockRouter.post('/createSM', function(req, res) {
  const name = req.body.name;
  const blocks = req.body.blocks;
  
//  console.log("name = " + name);
//  console.log("blocks = " + blocks);
  
  if(name === undefined) name = "undefined";
  if(blocks === undefined) {
    res.status(400).end();
    return;
  }
  
  xw = new XMLWriter;
  xw.startDocument();
  xw.startElement('FileName');
  xw.writeAttribute('name', name);
  xw.endElement();
 
  
//  console.log(blocks.constructor)
  blocks.forEach((element) => {
    loop_on_block(element, xw);
    
//    console.log("{");
//    for(var p in element) {
//      if(element.hasOwnProperty(p)) {
////        if(p.localeCompare("title") === 0) {
////          xw.writeElement(element[p]);
////        }
////        if(element[p].constructor === Array) {
////          
////        } else {
////          xw.
////        }
//        loop_on_block(element, xw);
////        console.log("\t" + p + " -> " + element[p])
////        loop_on_block(xw, element, p)
//      }
//    }
//    console.log("},")
  })
  
  xw.endDocument();
  
  console.log(xw.toString());
  res.status(200).end();
});
// ----------------------

blockRouter.post('/finalscript', function(req, res) {

  const type = req.body.type;
  const blocks = req.body.blocks;

  if(type === undefined || (type != "unix" && type != "windows")) {
    res.status(400).end();
    return;
  }
  if(blocks === undefined) {
    res.status(400).end();
    return;
  }

  var blockinfo = new Array();

  var finalstring= "";
  	blocks.forEach(function(block) {
	setTimeout(function(){
	request({
	  method: 'GET',
	  uri: "http://localhost:8080/block/infos/"+block['id'],
	  headers: {
	  	'Access-Control-Allow-Origin': '*',
	  	'Content-type': 'application/json'
	  },
	  json: true
	}, function (error, response, body) {
	  var bd = JSON.parse(JSON.stringify(body));
	  blockinfo.push(bd[0]);

	  blockinfo[blockinfo.length-1]['Instructions'].forEach(function(instruction) {
	  	if(type == instruction['platform']){
	  		if(instruction['type'].indexOf('arguments') != -1 && instruction['type'].indexOf('loop') == -1){
		  		var base = instruction['syntax'];
		  		for (var k in block['arguments']){
		  			base = base.replace("`"+k+"`", block['arguments'][k]);

				}
				finalstring += base;
		  		finalstring += '\n';
		  	}

		  	if(instruction['type'].indexOf('text-only') != -1 && instruction['type'].indexOf('loop') == -1){
		  		var base = instruction['syntax'];
				finalstring += base;
		  		finalstring += '\n';
		  	}

		  	if(instruction['type'].indexOf('blocs') != -1 && instruction['type'].indexOf('loop') == -1){

		  	}

	  	}
	  	
	  });

	  console.log(finalstring);
	  //console.log(bd[0]);
	  console.log("----------------------------------");
	})

  //console.log(blockinfo);
	/*request('GET', "http://localhost:8080/block/infos/"+block['id']).done((res) => {
	  console.log(res.body);
	});*/
	  }, 100);
  });
  setTimeout(function(){
  //console.log(blockinfo);
  res.status(201).json(blockinfo);

  }, 2000);
  });


module.exports = blockRouter;
