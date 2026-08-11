export function formatarCnpj(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 14)
  return digitos
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export function cnpjValido(cnpj: string): boolean {
  const digitos = cnpj.replace(/\D/g, '')

  if (digitos.length !== 14 || /^(\d)\1{13}$/.test(digitos)) {
    return false
  }

  const calcularDigito = (base: string) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const soma = base.split('').reduce((acc, char, i) => acc + Number(char) * pesos[i], 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  const digito1 = calcularDigito(digitos.slice(0, 12))
  const digito2 = calcularDigito(digitos.slice(0, 12) + digito1)

  return digitos === digitos.slice(0, 12) + String(digito1) + String(digito2)
}
