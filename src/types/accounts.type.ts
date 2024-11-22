export interface Resp {
    info_account:        InfoAccount;
    phone_email_account: PhoneEmailAccount;
    assigned_users:      AssignedUser[];
    comments:            Comments;
    related_accounts:    any[];
}

export interface AssignedUser {
    id:               string;
    assigned_user_id: string;
    principal:        string;
    iddivision_c:     string;
    idamercado_c:     string;
    idgrupocliente_c: string;
    idsector_c:       string;
    idregional_c:     string;
    idcanalvta_c:     string;
}

export interface Comments {
    id:              string;
    module:          string;
    idmodule:        string;
    description:     string;
    relevance:       string;
    visualizacion_c: string;
    created_by:      string;
}

export interface InfoAccount {
    detail_account:    DetailAccount;
    direction_account: DirectionAccount;
}

export interface DetailAccount {
    id:                           string;
    account_type:                 string;
    billing_address_city:         string;
    billing_address_country:      string;
    billing_address_state_list_c: string;
    industry:                     string;
    name:                         string;
    names_c:                      string;
    lastname_c:                   string;
    nit_ci_c:                     string;
    nombre_comercial_c:           string;
    regimen_tributario_c:         string;
    subindustry_c:                string;
    tipo_documento_c:             string;
    tipocuenta_c:                 string;
    idcuentasap_c:                string;
}

export interface DirectionAccount {
    billing_address_street:     string;
    billing_address_state:      string;
    shipping_address_street:    string;
    shipping_address_city:      string;
    shipping_address_state:     string;
    shipping_address_country:   string;
    address_street_generated_c: string;
    jjwg_maps_lat_c:            number;
    jjwg_maps_lng_c:            number;
    jjwg_maps_address_c:        string;
}

export interface PhoneEmailAccount {
    emails:            Email[];
    phones:            any[];
    celular_c:         string;
    phone_office:      string;
    phone_fax:         string;
    phone_office_wp_c: string;
    phone_office_cd_c: string;
    celular_wp_c:      string;
    celular_cd_c:      string;
}

export interface Email {
    id:              string;
    email_address:   string;
    primary_address: boolean;
    primary_item: boolean;
}