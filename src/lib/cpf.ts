export function formatarCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function cpfValido(cpf: string): boolean {
  const digitos = cpf.replace(/\D/g, '')

  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) {
    return false
  }

  const calcularDigito = (base: string) => {
    let soma = 0
    let peso = base.length + 1
    for (const char of base) {
      soma += Number(char) * peso
      peso -= 1
    }
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  const digito1 = calcularDigito(digitos.slice(0, 9))
  const digito2 = calcularDigito(digitos.slice(0, 9) + digito1)

  return digitos === digitos.slice(0, 9) + String(digito1) + String(digito2)
}
