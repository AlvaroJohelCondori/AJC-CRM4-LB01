export interface phone_email {
    module:       string;
    idModule:     string;
    idUser:       string;
    relatemodule: Relatemodule[];
}

export interface Relatemodule {
    nameModule: string;
    items:      Item[];
}

export interface Item {
    phone?:              string;
    country?:            string;
    country_code?:       string;
    whatsapp?:           string;
    primary_item:        string;
    email_address?:      string;
    email_address_caps?: string;
}

export interface phone_email_update {
    code:         number;
    EmailAddress: EmailAddress[];
    pho_phones:   PhoPhone[];
}

export interface EmailAddress {
    type:         string;
    id:           string;
    attributes:   EmailAddressAttributes;
    primary_item: string;
}

export interface EmailAddressAttributes {
    email_address:            string;
    email_address_caps:       string;
    invalid_email:            number;
    opt_out:                  number;
    confirm_opt_in:           string;
    confirm_opt_in_date:      string;
    confirm_opt_in_sent_date: string;
    confirm_opt_in_fail_date: string;
    confirm_opt_in_token:     string;
    date_created:             string;
    date_modified:            Date;
    deleted:                  number;
}

export interface PhoPhone {
    type:         string;
    id:           string;
    attributes:   PhoPhoneAttributes;
    primary_item: string;
}

export interface PhoPhoneAttributes {
    name:               string;
    date_entered:       Date;
    date_modified:      Date;
    modified_user_id:   string;
    modified_by_name:   string;
    created_by:         string;
    created_by_name:    string;
    description:        string;
    deleted:            number;
    created_by_link:    string;
    modified_user_link: string;
    assigned_user_id:   string;
    assigned_user_name: string;
    assigned_user_link: string;
    SecurityGroups:     string;
    phone:              string;
    country:            string;
    country_code:       string;
    whatsapp:           string;
}