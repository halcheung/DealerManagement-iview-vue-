let util = {

};
util.title = function (title) {
    title = title ? title + ' - Home' : 'DWTS';
    window.document.title = title;
};

export default util;