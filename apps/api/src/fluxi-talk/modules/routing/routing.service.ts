import { Injectable } from "@nestjs/common";
import type { FluxiDemandType, FluxiSector, FluxiUserType, RouteResolution } from "../../state/state.types";

@Injectable()
export class RoutingService {
  route(userType: FluxiUserType, demandType: FluxiDemandType | null): RouteResolution {
    if (userType === "fornecedor") {
      return { sector: "suprimentos", reason: "Fornecedor deve ser tratado por Suprimentos" };
    }

    if (userType === "corretor") {
      return { sector: "comercial", reason: "Corretor é tratado por Comercial" };
    }

    if (userType === "lead") {
      return { sector: "comercial", reason: "Lead direcionado ao Comercial" };
    }

    const byDemand: Record<FluxiDemandType, FluxiSector> = {
      manutencao: "engenharia",
      financeiro: "financeiro",
      vistoria: "engenharia",
      acompanhamento: "relacionamento",
      cobranca: "financeiro",
      operacional: "operacoes",
      comercial: "comercial",
      outro: "relacionamento"
    };

    if (!demandType) {
      return { sector: "relacionamento", reason: "Sem demanda definida, fallback para Relacionamento" };
    }

    return { sector: byDemand[demandType], reason: `Demanda ${demandType} mapeada para ${byDemand[demandType]}` };
  }
}
