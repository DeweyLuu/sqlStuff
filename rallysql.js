var express = require('express');
var app = express();
var rally = require('rally');
var queryUtils = rally.util.query;
var fs = require('fs');
var json2csv = require('json2csv');
var mysql = require('mysql');

var restApi = rally({
	apiKey: '_HSiq55uzTLKnoJO1qQTymYClsbsXS0Uhw8uGRME',
	requestOptions: {
    headers: {
      'X-RallyIntegrationName': 'My cool node.js program',
      'X-RallyIntegrationVendor': 'TrueBlue',
      'X-RallyIntegrationVersion': '1.0'
    }
  }
});

var bigStories = [];
var story = {};

function nodePromise(fn) {
	return new Promise(function(resolve, reject) {
		fn(function(err, res) {
			if (err) reject(err);
			else resolve(res);
		});
	});
}

function query(params) {
	return nodePromise(function(cb){
		restApi.query(params, cb);
	})
}

var gotDate = new Date();
var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var gotDate1 = month[gotDate.getMonth()];
var gotDate2 = gotDate.getDate();
var gotDate3 = gotDate.getFullYear();
var gotDate4 = gotDate.getHours();
    if (gotDate4 < 10) {
      	gotDate4 = "0" + gotDate4;
    }
    /*
var gotDate5 = gotDate.getMinutes();
    if (gotDate5 < 10) {
       	gotDate5 = "0" + gotDate5;
    }
    */
var theTimeStamp = gotDate3 + gotDate1 + gotDate2 + "-" +  gotDate4;

function entireQuery() {
	query({
		type: 'HierarchicalRequirement', //the type to query
	    start: 1, //the 1-based start index, defaults to 1
	    pageSize: 2, //the page size (1-200, defaults to 200)
	    limit: Infinity, //the maximum number of results to return- enables auto paging
	    order: 'Rank', //how to sort the results
/*
	    fetch: ['Name', 'c_GroomingState', 'Epic', 'FormattedID', 'Project', 'Parent', 'Iteration',
	    'ScheduleState', 'c_KanbanState', 'Tasks', 'Blocked', 'BlockedReason', 'c_ReleasePriority', 
	    'PlanEstimate', 'Projects', 'c_ArchitectEstimate', 'State'],
*/
	    fetch: ['Name', 'c_GroomingState', 'Epic', 'FormattedID', 'Project', 'Parent', 'Iteration',
        'ScheduleState', 'c_KanbanState', 'Tasks', 'Blocked', 'BlockedReason', 'c_ReleasePriority', 
        'PlanEstimate', 'Projects', 'c_PreviousEstimate', 'State', 'c_StoryRank', 'c_EpicRank', 'c_TPO', 
        'Milestones', 'Owner', 'LeafStoryPlanEstimateTotal', 'AcceptedLeafStoryPlanEstimateTotal', 
        'LeafStoryCount', 'UnEstimatedLeafStoryCount', 'AcceptedLeafStoryCount', 'Ready', 'Release', 'c_Architect'],

        query: queryUtils.where('Project', '=', '/project/50982925414') //info dev
        .or('Project', '=', '/project/50982926429') //finance
        .or('Project', '=', '/project/50983112863') //qwod
        .or('Project', '=', '/project/49998887731') //prism
        .or('Project', '=', '/project/55635571848') //db migration
        .or('Project', '=', '/project/50982923609') //core
        .or('Project', '=', '/project/56200604007') //prism dev
        .and('DirectChildrenCount', '<', '1'),    
	    scope: {
	    	workspace: '/workspace/48926045219',
	    },
	    requestOptions: {}
	})
	.then(function(topResult) {
/*
		var connection = mysql.createPool({
			host: 'localhost',
			user: 'root',
			password: '2282',
			database: 'rallyreport'
		})
*/
		var connection = mysql.createPool({
			host: 'tbtaRALYSQLp101',
			user: 'rally_reports',
			password: 'pGECfzQk5ARU',
			database: 'rally_reports'
		})

		connection.getConnection(function(err, connected) {
			if(err) {
				connected.release();
				console.log('could not get connected');
			}

			var theResults = topResult.Results;

			for (var i = 0; i <= theResults.length-1; i++) {
	        	bigStories.push(theResults[i]);
	        	story.date = theTimeStamp;
	        	story.storyID = bigStories[i].FormattedID;
	        	story.storyName = bigStories[i].Name;
	        	story.storyGroomingState = bigStories[i].c_GroomingState;	
	        	story.storyScheduleState = bigStories[i].ScheduleState;
	        	story.ready = bigStories[i].Ready;
	        	story.storyKanbanState = bigStories[i].c_KanbanState;
	        	story.projectName = bigStories[i].Project.Name;
	        	story.blocked = bigStories[i].Blocked;
	        	story.blockedReason = bigStories[i].BlockedReason;
	        	story.storyPlanEstimate = bigStories[i].PlanEstimate;
	        	story.storyReleasePriority = bigStories[i].c_ReleasePriority;
	        	
	        	if(bigStories[i].c_Architect != null) {
	        		story.Architect = bigStories[i].c_Architect;
	        	} else {
	        		story.Architect = null;
	        	}

	        	if(bigStories[i].c_TPO != null) {
	        		story.TPO = bigStories[i].c_TPO;
	        	} else {
	        		story.TPO = null;
	        	}

	        	if(bigStories[i].Release != null) {
	        		story.releases = bigStories[i].Release.Name;
	        	} else {
	        		story.releases = null;
	        	}

	        	if(bigStories[i].Owner != null) {
	        		story.owner = bigStories[i].Owner._refObjectName;
	        	} else {
	        		story.owner = null;
	        	}

	        	if(bigStories[i].Parent != null) {
	        		story.parentName = bigStories[i].Parent.Name;
	        	} else {
	        		story.parentName = null;
	        	}
	        	if(bigStories[i].Iteration == null) {
	        		story.iterationName = null;
	        	} else {
	        		story.iterationName = bigStories[i].Iteration.Name;
	        	}

	        	if (theResults[i].Epic == null) {	
	        		bigStories[i].Epic = null;
	        		story.epicID = null;
	        		story.epicName = null;
	        		story.epicArchitectEstimate = null;
	        		story.epicReleasePriority = null;
	        		story.epicStateName = null;	  
	        		story.LeafStoryPlanEstimateTotal = null;
	        		story.AcceptedLeafStoryPlanEstimateTotal = null;
	        		story.LeafStoryCount = null;
	        		story.UnEstimatedLeafStoryCount = null;
	        		story.AcceptedLeafStoryCount = null;      		
	        		
	        		story.themeID = null;
	        		story.themeName = null;
	        		story.themeState = null;
	        		story.themeProjects = null;
	        		story.themeReleasePriority = null;		        	
	    	    } else if (theResults[i].Epic != null && theResults[i].Epic.Parent == null){
	        		bigStories[i].Epic.Parent = null;
	        		story.epicID = bigStories[i].Epic.FormattedID;
	        		story.epicName = bigStories[i].Epic.Name;
	        		story.epicArchitectEstimate = bigStories[i].Epic.c_PreviousEstimate;
	        		story.epicReleasePriority = bigStories[i].Epic.c_ReleasePriority;
	        		if(theResults[i].Epic.State != null) {
	        			story.epicStateName = bigStories[i].Epic.State.Name;	
	        		} else {
	        			story.epicStateName = null;
	        		}
	        		story.LeafStoryPlanEstimateTotal = bigStories[i].Epic.LeafStoryPlanEstimateTotal;
	        		story.AcceptedLeafStoryPlanEstimateTotal = bigStories[i].Epic.AcceptedLeafStoryPlanEstimateTotal;
	        		story.LeafStoryCount = bigStories[i].Epic.LeafStoryCount;
	        		story.UnEstimatedLeafStoryCount = bigStories[i].Epic.UnEstimatedLeafStoryCount;
	        		story.AcceptedLeafStoryCount = bigStories[i].Epic.AcceptedLeafStoryCount;

	        		story.themeID = null;
	        		story.themeName = null;
	        		story.themeState = null;
	        		story.themeProjects = null;
	        		story.themeReleasePriority = null;	        		
	        	} else {
	        		bigStories[i].Theme = theResults[i].Epic.Parent;
	        		story.epicID = theResults[i].Epic.FormattedID;
	        		story.epicName = theResults[i].Epic.Name;
	        		story.epicArchitectEstimate = theResults[i].Epic.c_PreviousEstimate;
	        		story.epicReleasePriority = theResults[i].Epic.c_ReleasePriority;
	        		if(theResults[i].Epic.State != null) {
	        			story.epicStateName = bigStories[i].Epic.State.Name;	
	        		} else {
	        			story.epicStateName = null;
	        		}	        		
	        		story.LeafStoryPlanEstimateTotal = bigStories[i].Epic.LeafStoryPlanEstimateTotal;
	        		story.AcceptedLeafStoryPlanEstimateTotal = bigStories[i].Epic.AcceptedLeafStoryPlanEstimateTotal;
	        		story.LeafStoryCount = bigStories[i].Epic.LeafStoryCount;
	        		story.UnEstimatedLeafStoryCount = bigStories[i].Epic.UnEstimatedLeafStoryCount;
	        		story.AcceptedLeafStoryCount = bigStories[i].Epic.AcceptedLeafStoryCount;

	        		story.themeID = theResults[i].Epic.Parent.FormattedID;
	        		story.themeName = theResults[i].Epic.Parent.Name;
	        		if(theResults[i].Epic.Parent.State != null) {
	        			story.themeState = theResults[i].Epic.Parent.State.Name;	
	        		} else {
	        			story.themeState = null;
	        		}
	        		story.themeProjects = theResults[i].Epic.Parent.c_Projects;
	        		story.themeReleasePriority = theResults[i].Epic.Parent.c_ReleasePriority;	
	        		
	        	}

	        	connected.query('insert into bigreport set ?', story, function(err, result) {
					if (err) {
						console.log(err);
					}
					
				})


	        }
	        console.log(story);
	        console.log('Successfully pushed up to database');
		})
	})

	.catch(function(err) {
		console.error(err);
		process.exit(1);
	})
};

entireQuery();

app.listen(3000, function() {
	console.log('server started');
});
