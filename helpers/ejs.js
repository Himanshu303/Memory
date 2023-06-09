const moment = require("moment");

module.exports = {
  formatDate: function (date, format) {
    return moment(date).format(format);
  },
  truncate: (str, len) => {
    if (str.length > len && str.length > 0) {
      let new_str = str + " ";
      new_str = str.substr(0, len);
      new_str = str.substr(0, new_str.lastIndexOf(" "));
      new_str = new_str.length > 0 ? new_str : str.substr(0, len);
      return new_str + "...";
    }
    return str;
  },
  stripTags: (input) => {
    input = input.replace(/<(?:.|\n)*?>/gm, "");
    return input.replace(/\&nbsp;/gm, " ");
  },
  editIcon: (storyUser, loggedUser, storyId, floating = true) => {
    if (storyUser._id.toString() == loggedUser._id.toString()) {
      if (floating) {
        return `  <a href="/stories/edit/${storyId}" class="btn btn-primary position-absolute top-0 end-0 translate-middle"><i class="fas fa-edit"></i></a>`;
      } else {
        return `<a href="/stories/edit/${storyId}"><i class="fas fa-edit"></i></a>`;
      }
    } else {
      return "";
    }
  },
  statusList: ["Public", "Private"],
  escapeRegExp: (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  },
};
