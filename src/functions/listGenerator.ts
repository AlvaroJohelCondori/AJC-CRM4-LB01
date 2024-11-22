
export const listGenerator  = async (
  table_name: string,
  join: string,
  params: {
    page: string,
    rowsPerPage: string,
    order: string,
    created_by: [],
    modified_by: [],
    assigned_to: [],
    dateFilter: [{
      column: string,
      from: string,
      to: string,
    }],
    columnsFilterValuePrincipal: string,
    columnsFilter:[{
      column: string,
      table: string,
      valueFilterAdvance: string,
      typeFilterAdvance: string,
      columnforfilterPrincipal: boolean,
    }]
  }
)=>{
  const module = table_name;
  const {
    page,
    rowsPerPage  ,
    order  ,
    created_by,
    modified_by,
    assigned_to,
    dateFilter,
    columnsFilterValuePrincipal,
    columnsFilter
  } = params

  // genera filtro principal
  let concat: string = ``;
  let filterPrincipal: string = ``;

  if(columnsFilterValuePrincipal && columnsFilterValuePrincipal != ''){
    for(let i = 0 ; i < columnsFilter.length ; i++){
      if(columnsFilter[i].columnforfilterPrincipal == true){
        concat += `${columnsFilter[i].table}.${columnsFilter[i].column},'' '',`;
      }
    }
    concat = concat.substring(0, concat.length - 7);
    filterPrincipal += columnsFilter.length ==  1 ? ` AND (${concat.substring(0, concat.length - 7)} LIKE (''%${columnsFilterValuePrincipal}%'') or ''${columnsFilterValuePrincipal}'' = '''' )` : ` AND (CONCAT(${concat}) LIKE (''%${columnsFilterValuePrincipal}%'') or ''${columnsFilterValuePrincipal}'' = '''' )`;
  }

  // genera la condición in para buscar usuarios
  const users_created_by = created_by.length == 0 ? ``: `AND (${module}.created_by in (''${comas(created_by)}''))`;
  const users_modified_by = modified_by.length == 0 ? ``: `AND (${module}.modified_by in (''${comas(modified_by)}''))`;
  const users_assigned_to = assigned_to.length == 0 ? ``: `AND (${module}.assigned_user_id in (''${comas(assigned_to)}''))`;

  let query_select: string = '';
  let query_where_filter: string = '';
  for(let i = 0 ; i < columnsFilter.length ; i++){
    //genera las columnas de select
    query_select += `${columnsFilter[i].table}.${columnsFilter[i].column} AS ${module}_${columnsFilter[i].column},`;

    //genera los AND's de where para búsquedas
    if(columnsFilter[i].valueFilterAdvance != "" && columnsFilter[i].typeFilterAdvance == '=') query_where_filter += `AND (${columnsFilter[i].table}.${columnsFilter[i].column} = ''${columnsFilter[i].valueFilterAdvance}'') `;
    if(columnsFilter[i].valueFilterAdvance != "" && columnsFilter[i].typeFilterAdvance == '~') query_where_filter += `AND (${columnsFilter[i].table}.${columnsFilter[i].column} like ''%${columnsFilter[i].valueFilterAdvance}%'') `
  }

  // verifica si existe un order by
  let order_query: string = '';
  if(order && order.charAt(0) == '-') order_query = `order by ${module}.${order.slice(1)} desc`;
  if(order && order.charAt(0) == '+') order_query = `order by ${module}.${order.slice(1)} asc`;

  //genera paginador de listado
  const paginador = `OFFSET CAST(CAST(((${page}-1)*${rowsPerPage}) AS NVARCHAR(10)) AS INTEGER) ROWS FETCH NEXT CAST(CAST(${rowsPerPage} AS NVARCHAR(10)) AS INTEGER) ROWS ONLY`;

  //genera filtro por fecha
  let date_filter: string = ``;
  for(let i=0 ; i< dateFilter.length ; i++){
    if(dateFilter[i].column != '' && dateFilter[i].from != '' && dateFilter[i].to)
      date_filter += `AND (${module}.${dateFilter[i].column} BETWEEN ''${dateFilter[i].from}'' AND ''${dateFilter[i].to}'') `;
      query_select += `CONVERT(varchar, ${module}.${dateFilter[i].column},103) AS ${module}_${dateFilter[i].column},`
      // CONVERT(varchar, ${module}.date_modified,103) AS ${module}_date_modified,
  }

  //join de de accounts
  const query = `
    SELECT
      ${module}.id AS ${module}_id,
      ${module}.modified_user_id AS ${module}_modified_user_id,
      ${module}.assigned_user_id AS ${module}_assigned_user_id,
      ${query_select}
      ${module}.modified_user_id,
			${module}.assigned_user_id,
      ${module}.created_by,
      CONCAT(us.first_name,'' '',us.last_name) AS ${module}_created_by,
      CONCAT(us2.first_name,'' '',us2.last_name) AS ${module}_assigned_user,
      CONCAT(us1.first_name,'' '',us1.last_name) AS ${module}_modified_user
    FROM ${module} WITH (NOLOCK)
    LEFT JOIN ${module}_cstm WITH (NOLOCK) ON ${module}_cstm.id_c = ${module}.id
    LEFT JOIN users us WITH (NOLOCK) ON us.id = ${module}.created_by and us.deleted = 0
    LEFT JOIN users us1 WITH (NOLOCK) ON us1.id = ${module}.assigned_user_id  and us1.deleted = 0
    LEFT JOIN users us2 WITH (NOLOCK) ON us2.id = ${module}.modified_user_id  and us2.deleted = 0
    ${join}
    WHERE ${module}.deleted = 0
      ${date_filter}
      ${filterPrincipal}
      ${users_created_by}
      ${users_modified_by}
      ${users_assigned_to}
      ${query_where_filter}
      ${order_query}
      ${paginador};
  `;

  return query;
}
// separa con comas los campos de un array
const comas=(array: string[])=>{
  let separadoPorComas: string = '';
  for(let i = 0 ; i < array.length ; i++){
    separadoPorComas += i < array.length -1 ? `${array[i]},` : array[i];
  }
  return separadoPorComas;
}
