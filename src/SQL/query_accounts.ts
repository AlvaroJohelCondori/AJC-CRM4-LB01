export const queries = {
    Users_Assigned_By_Bean: "EXEC [" + process.env.SQL_DATABASE + "].[crm4].[Users_Assigned_By_Bean]",
    Update_hana_relaciones_accounts_c:"UPDATE [" + process.env.SQL_DATABASE + "].[dbo].[hana_relaciones_accounts_c] SET date_modified = @date_modified WHERE hana_relaciones_accountsaccounts_ida = @id_account AND hana_relaciones_accountshana_relaciones_idb = @id_hana_relaciones"
}