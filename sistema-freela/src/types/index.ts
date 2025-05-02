export interface SessaoTrabalho {
    data: string
    inicio: string
    fim: string
  }
  
  export interface OrdemDeServico {
    numero: string
    cliente: string
    parceiro: string
    projeto: string
    tarefa: string
    observacoes: string
    sessoes: SessaoTrabalho[]
    aguardandoCliente: boolean
    aguardandoParceiro: boolean
    finalizado: boolean
    trabalhando: boolean
    naFila: boolean
    urgente: boolean
    aberto_em?: string
    finalizado_em?: string
  }
  