export function somenteNumerosCpf(
  valor: string
) {
  return String(valor ?? '')
    .replace(/\D/g, '');
}

export function validarCpf(
  valor: string
) {
  const cpf =
    somenteNumerosCpf(valor);

  if (cpf.length !== 11) {
    return false;
  }

  // Recusa números repetidos, como 11111111111
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;

  for (
    let indice = 0;
    indice < 9;
    indice += 1
  ) {
    soma +=
      Number(cpf[indice]) *
      (10 - indice);
  }

  let primeiroDigito =
    (soma * 10) % 11;

  if (primeiroDigito === 10) {
    primeiroDigito = 0;
  }

  if (
    primeiroDigito !==
    Number(cpf[9])
  ) {
    return false;
  }

  soma = 0;

  for (
    let indice = 0;
    indice < 10;
    indice += 1
  ) {
    soma +=
      Number(cpf[indice]) *
      (11 - indice);
  }

  let segundoDigito =
    (soma * 10) % 11;

  if (segundoDigito === 10) {
    segundoDigito = 0;
  }

  return (
    segundoDigito ===
    Number(cpf[10])
  );
}

export function calcularIdade(
  nascimento: string
) {
  if (!nascimento) {
    return null;
  }

  const data =
    new Date(
      `${nascimento}T12:00:00`
    );

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return null;
  }

  const hoje = new Date();

  let idade =
    hoje.getFullYear() -
    data.getFullYear();

  const aniversarioPendente =
    hoje.getMonth() <
      data.getMonth() ||
    (
      hoje.getMonth() ===
        data.getMonth() &&
      hoje.getDate() <
        data.getDate()
    );

  if (aniversarioPendente) {
    idade -= 1;
  }

  return idade >= 0
    ? idade
    : null;
}