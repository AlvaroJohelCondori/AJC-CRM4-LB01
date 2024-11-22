export interface RespMiembroDelete {
    code:             number;
    related_accounts: string;
}

export interface RespCreateMiembro {
    code:             number;
    module:           string;
    idmodule:         string;
    related_accounts: RelatedAccount[];
}

export interface RelatedAccount {
    idmodulo: string;
    module:   string;
    name:     string;
}