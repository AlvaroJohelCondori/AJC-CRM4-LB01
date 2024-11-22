export interface RespComments {
    comments: CommentsA;
}

export interface CommentsA {
    id:              string;
    module:          string;
    idmodule:        string;
    description:     string;
    relevance:       string;
    visualizacion_c: string;
    created_by:      string;
}


export interface RespCommentsDelete {
    comments: string;
}
