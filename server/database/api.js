var Q = require('bluebird');

module.exports = function(admin) {

    function _createContent(data) {
        return admin.Content.create(data);
    }

    function createContent(data) {
    	return _createContent(data);
    }

    //{platform:'', name:''}
    function checkContentExists(data) {
        return admin.Content.findAll({
            where: {
                platform: data['platform'],
                platformId: data['platformId']
            },
            include: [admin.Project]
        }).then(function(res) {
            if (res.length === 0) {
                return false;
            } else {
                //return instance
                return res[0];
            }
        });
    }
    return {
        createContent: createContent,
        checkContentExists: checkContentExists
    }
};