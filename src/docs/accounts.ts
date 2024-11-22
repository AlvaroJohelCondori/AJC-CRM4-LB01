export interface requestAccountNew {
  "info_account": {
    "detail_account": {
        "tipo_documento_c": "01",
        "account_type": "Customer",
        "regimen_tributario_c": "01",
        "billing_address_country": "BO",
        "tipocuenta_c": "Empresa",
        "name": "empresa PRUEBA",
        "nombre_comercial_c": "EmP SRL",
        "nit_ci_c": "532432532",
        "celular_c": "624323324 - 75325324",
        "industry": "C0",
        "subindustry_c": "C0_C44",
        "billing_address_state_list_c": "La Paz",
        "billing_address_city": "El Alto",
        "description": "pruebas"
    },
    "direction_account": {
        "billing_address_street": "Av. Litoral",
        "billing_address_state": "La Paz",
        "shipping_address_street": "La Paz",
        "shipping_address_city": "El Alto",
        "shipping_address_state": "La Paz",
        "shipping_address_country": "BO",
        "address_street_generated_c": "Av. Litoral_gnrtd",
        "jjwg_maps_lat_c": "0",
        "jjwg_maps_lng_c": "0",
        "jjwg_maps_address_c": "Av. Litoral"
    }
  },
  "phone_email_account": {
    "emails": [
        {
            "primary_address": true,
            "email_address": "test@example.com"
        },
        {
            "primary_address": false,
            "email_address": "test2@example.com"
        }
    ],
    "phones": [
        {
            "phone": "624323324",
            "country_code": "+591",
            "country": "BO",
            "principal": "1",
            "whatsapp": "1"
        },
        {
            "phone": "75325324",
            "country_code": "+591",
            "country": "BO",
            "principal": "0",
            "whatsapp": "1"
        }
    ]
  },
  "assigned_users": [
    {
        "assigned_user_id": "0051F8EE-3D26-4604-B045-DAF75B96F72",
        "principal": "yes",
        "iddivision_c": "03",
        "idamercado_c": "03_02",
        "idgrupocliente_c": "31",
        "idsector_c": "16",
        "idregional_c": "02",
        "idcanalvta_c": "03_02_01"
    },
    {
        "assigned_user_id": "00EBB9F1-9FED-4C5B-9ECB-3F0C4566982",
        "principal": "yes",
        "iddivision_c": "03",
        "idamercado_c": "03_02",
        "idgrupocliente_c": "31",
        "idsector_c": "16",
        "idregional_c": "02",
        "idcanalvta_c": "03_02_01"
    }
  ],
  "comments": {
    "module": "Accounts",
    "idmodule": null,
    "visualizacion_c": "interno",
    "description": "pruebas",
    "relevance": "medium",
    "modulecoments": "HANPC_Comentarios"
  },
  "related_accounts": [
    {
        "relatedmodule": "Accounts",
        "idmodulo": "000786B9-BA41-4810-AD71-0AF6EEF25F11"
    },
    {
        "relatedmodule": "Accounts",
        "idmodulo": "000A0A46-6EFE-4FF6-AC86-D8B49B104005"
    },
    {
        "relatedmodule": "Accounts",
        "idmodulo": "000A69EE-3990-4997-AE96-66AA0B4FB727"
    }
  ]
}
