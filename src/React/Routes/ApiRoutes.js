const ApiRoutes = {
    // TODO: Изменить роут
    BASE_URL: "https://pbr.atmadev.ru",
    // BASE_URL: "http://127.0.0.1:8000",

    API_DECODE_USER_DATA: "/api/web/decode/user/",
    API_UPLOAD_IMAGE: "/api/web/upload/",
    API_SEARCH: "/api/web/ideas/search/",
    API_GET_CATEGORIES: "/api/web/ideas/getCategories/",
    API_GET_IDEAS: "/api/web/ideas/getIdeas/{0}/",
    API_NEW_IDEA: "/api/user/ideas/new/",
    API_SET_STATUS: "/api/admin/ideas/setStatus/",
    API_NEW_VOTE: "/api/user/ideas/newVote/",
    API_DELETE_VOTE: "/api/user/delete/vote/",
    API_NEW_COMMENT: "/api/user/ideas/newComment/",
    API_DELETE_COMMENT: "/api/user/delete/comment/",
    API_LOGIN: "/ru/login",
    API_GET_ONE_IDEA: "/api/web/idea/{0}/",
    API_GET_USER_DATA: "/api/web/user/{0}/",
    API_SIGN_IN: "/api/web/signIn/",
};

export default ApiRoutes;