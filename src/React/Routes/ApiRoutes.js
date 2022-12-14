const ApiRoutes = {
    // TODO: Изменить роут
    // BASE_URL: "https://tips.atmaguru.online",
    BASE_URL: "http://127.0.0.1:8000",

    API_DECODE_USER_DATA: "/api/web/decode/user/",
    API_UPLOAD_IMAGE: "/api/web/upload/",
    API_SEARCH: "/api/web/ideas/search/",
    API_GET_CATEGORIES: "/api/web/ideas/getCategories/",
    API_GET_IDEAS: "/api/web/ideas/getIdeas/",
    API_NEW_IDEA: "/api/user/ideas/new/",
    API_CHANGE_IDEA: "/api/user/idea/changeIdea/",
    API_SET_CATEGORY: "/api/admin/ideas/setCategory/",
    API_SET_TYPE: "/api/admin/ideas/setType/",
    API_SET_STATUS: "/api/admin/ideas/setStatus/",
    API_SET_ROLE: "/api/admin/ideas/setRole/",
    API_NEW_VOTE: "/api/user/ideas/newVote/",
    API_DELETE_VOTE: "/api/user/delete/vote/",
    API_NEW_COMMENT: "/api/user/ideas/newComment/",
    API_NEW_OFFICIAL_COMMENT: "/api/admin/ideas/setOfficialComment/",
    API_CHECK_ALL_COMMENTS: "/api/user/ideas/checkAllComments/",
    API_CHANGE_COMMENT: "/api/user/ideas/changeComment/",
    API_DELETE_COMMENT: "/api/user/delete/comment/",
    API_LOGIN: "/ru/login",
    API_GET_ONE_IDEA: "/api/web/idea/{0}/",
    API_GET_USER_DATA: "/api/web/user/{0}/",
    API_SIGN_IN: "/api/web/signIn/",
    API_SET_PROFILE: "/api/user/setProfile/",
    API_DELETE_IDEA: "/api/web/delete/idea/",
    API_UNSUBSCRIBE_USER: "/api/user/unsubscribe/",
    API_RELEASE_TELEGRAM_KEY: "/api/user/add/registration-key/"
};

export default ApiRoutes;