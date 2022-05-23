// const ApiURL = "https://pbr.atmadev.ru"
const ApiURL = "http://127.0.0.1:8000";

const ApiRoutes1 = {
    API_DECODE_USER_DATA: ApiURL + "/api/decode/user/",
    API_UPLOAD_IMAGE: ApiURL + "/api/upload/",
    API_SEARCH: ApiURL + "/ideas/api/search/",
    API_GET_CATEGORIES: ApiURL + "/ideas/api/getCategories/",
    API_GET_IDEAS: ApiURL + "/ideas/api/getIdeas/{0}/",
    API_NEW_IDEA: ApiURL + "/ideas/api/new/",
    API_SET_STATUS: ApiURL + "/ideas/api/setStatus/",
    API_NEW_VOTE: ApiURL + "/ideas/api/newVote/",
    API_DELETE_VOTE: ApiURL + "/api/delete/vote/",
    API_NEW_COMMENT: ApiURL + "/ideas/api/newComment/",
    API_DELETE_COMMENT: ApiURL + "/api/delete/comment/",
    API_LOGIN: ApiURL + "/ru/login",
    API_GET_ONE_IDEA: ApiURL + "/api/web/idea/{0}/"
};

const ApiRoutes = {
    API_DECODE_USER_DATA: ApiURL + "/api/web/decode/user/",
    API_UPLOAD_IMAGE: ApiURL + "/api/web/upload/",
    API_SEARCH: ApiURL + "/api/web/ideas/search/",
    API_GET_CATEGORIES: ApiURL + "/api/web/ideas/getCategories/",
    API_GET_IDEAS: ApiURL + "/api/web/ideas/getIdeas/{0}/",
    API_NEW_IDEA: ApiURL + "/api/user/ideas/new/",
    API_SET_STATUS: ApiURL + "/api/admin/ideas/setStatus/",
    API_NEW_VOTE: ApiURL + "/api/user/ideas/newVote/",
    API_DELETE_VOTE: ApiURL + "/api/user/delete/vote/",
    API_NEW_COMMENT: ApiURL + "/api/user/ideas/newComment/",
    API_DELETE_COMMENT: ApiURL + "/api/admin/delete/comment/",
    API_LOGIN: ApiURL + "/ru/login",
    API_GET_ONE_IDEA: ApiURL + "/api/web/idea/{0}/"
};

export default ApiRoutes;