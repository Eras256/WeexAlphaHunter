
import { logger } from './logger.js';

export interface SymbolicRule {
    id: string;
    description: string;
    validate: (context: any) => boolean;
    severity: 'BLOCK' | 'WARN';
}

/**
 * MOTOR DE VALIDACIÓN NEURO-SIMBÓLICA (Mock Prolog Engine)
 * 
 * Actúa como un sistema experto determinista que audita la salida del consenso (Probabilística)
 * antes de la ejecución. Implementa la lógica de "Guardrails" descrita en la arquitectura.
 * 
 * Equivalente TypeScript al motor Prolog/Datalog propuesto en el Whitepaper.
 */
export class SymbolicGuardrails {
    private rules: SymbolicRule[] = [];

    constructor() {
        this.initializeRules();
    }

    private initializeRules() {
        // Regla 1: Bloqueo de Alto Riesgo en Tendencia Bajista
        this.addRule({
            id: 'RISK_BEAR_MARKET_BUY',
            description: 'No comprar activos de alta volatilidad si la tendencia macro es bajista',
            severity: 'BLOCK',
            validate: (ctx) => {
                if (ctx.action === 'BUY' && ctx.trend === 'BEARISH' && ctx.rsi > 30) {
                    // Solo permitir "Rebotes de Gato Muerto" extremos (RSI < 25)
                    // Si RSI > 30 y tendencia es bajista, BLOQUEAR compra estándar.
                    return false;
                }
                return true;
            }
        });

        // Regla 2: Límite de Exposición (Riesgo de Ruina)
        this.addRule({
            id: 'MAX_EXPOSURE_LIMIT',
            description: 'El tamaño de la posición no puede exceder el 10% del capital líquido en una sola operación',
            severity: 'BLOCK',
            validate: (ctx) => {
                // Simplificación: asumiendo que quantity * price < 10% equity
                // En una implementación real, calcularíamos el % exacto.
                // Por ahora, asumimos que el executor ya maneja el tamaño, esto es un check de sanidad.
                if (ctx.quantity * ctx.price > 5000) { // Ejemplo de Hard Cap
                    return false;
                }
                return true;
            }
        });

        // Regla 3: Consenso Mínimo (Evitar Alucinaciones Aisladas)
        this.addRule({
            id: 'MIN_CONSENSUS_THRESHOLD',
            description: 'Si la confianza del modelo es baja (<60%), requerir confirmación secundaria',
            severity: 'WARN',
            validate: (ctx) => {
                if (ctx.confidence < 0.60 && ctx.action !== 'HOLD') {
                    return false;
                }
                return true;
            }
        });

        // Regla 4: Integridad de Precios (Anti-Flash Crash)
        this.addRule({
            id: 'PRICE_SANITY_CHECK',
            description: 'Verificar que el precio no sea cero ni negativo',
            severity: 'BLOCK',
            validate: (ctx) => {
                if (ctx.price <= 0 || isNaN(ctx.price)) return false;
                return true;
            }
        });
    }

    private addRule(rule: SymbolicRule) {
        this.rules.push(rule);
    }

    /**
     * Verifica una propuesta de operación contra todas las reglas lógicas.
     * Retorna { approved: boolean, reason: string }
     */
    public verify(context: {
        action: string,
        symbol: string,
        price: number,
        quantity: number,
        trend: string,
        rsi: number,
        confidence: number
    }): { approved: boolean, violations: string[] } {
        const violations: string[] = [];

        for (const rule of this.rules) {
            try {
                const passed = rule.validate(context);
                if (!passed) {
                    const msg = `[${rule.severity}] ${rule.id}: ${rule.description}`;
                    violations.push(msg);

                    if (rule.severity === 'BLOCK') {
                        logger.warn(`🛑 NEURO-SYMBOLIC BLOCK: ${msg}`);
                        return { approved: false, violations };
                    } else {
                        logger.warn(`⚠️ NEURO-SYMBOLIC WARN: ${msg}`);
                    }
                }
            } catch (e) {
                logger.error(`Error executing rule ${rule.id}`, e);
                // Fail safe: If logic fails, block trade
                return { approved: false, violations: [`SYSTEM_ERROR: Rule ${rule.id} crashed`] };
            }
        }

        return { approved: true, violations };
    }
}

export const symbolicGuardrails = new SymbolicGuardrails();
