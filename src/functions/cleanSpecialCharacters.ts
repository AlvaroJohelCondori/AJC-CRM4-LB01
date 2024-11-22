
export const cleanSpecialCharacters = (variable: string) => {
  // caracteres especiales
  const esc = [`'`, `%`, `|`, `=`, `<`, `>`, `*`, `/`, `+`, `$`, `?`, `¿`, `¡`, `!`];

  const aux = variable.length / 2;
  for (let i = 0; i < aux; i++) {
    esc.forEach(elemento => {
      variable = variable.replace(elemento, ``);
    });
  }
  return variable
}

export const validarValor = (texto: string) => {
  const entities: {[key: string]: string} = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&#039;": "'"
    // Agrega más entidades HTML según tus necesidades
  };

  return texto.replace(/&[\w#]+;/g, match => {
    const entity = entities[match];
    return entity ? entity : match;
  });
}

// export const validarValor = (texto: string): string[] | null => {
//   const regex = /[a-zA-Z0-9áñÑ&]+/g;
//   const coincidencias = texto.match(regex);

//   return coincidencias;
// }
