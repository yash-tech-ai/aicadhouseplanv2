import { Injectable } from '@nestjs/common';
import { Rule } from '@/database/entities/rule.entity';
import * as math from 'mathjs';

export interface RuleEvaluationResult {
  ruleName: string;
  ruleId: string;
  passed: boolean;
  score: number;
  details: string;
  violations: string[];
  suggestions: string[];
}

@Injectable()
export class RuleEngineService {
  evaluateRule(rule: Rule, parameters: any): RuleEvaluationResult {
    const result: RuleEvaluationResult = {
      ruleName: rule.name,
      ruleId: rule.id,
      passed: true,
      score: 100,
      details: '',
      violations: [],
      suggestions: [],
    };

    const config = rule.ruleConfig;

    // Evaluate conditions
    if (config.conditions && Array.isArray(config.conditions)) {
      const conditionResults = config.conditions.map(condition =>
        this.evaluateCondition(condition, parameters),
      );

      const failedConditions = conditionResults.filter(r => !r.passed);

      if (failedConditions.length > 0) {
        result.passed = false;
        result.violations = failedConditions.map(c => c.message);
        result.score = Math.max(
          0,
          100 - (failedConditions.length / conditionResults.length) * 100,
        );
      }
    }

    // Evaluate formulas
    if (config.formula) {
      const formulaResult = this.evaluateFormula(config.formula, parameters);

      if (!formulaResult.passed) {
        result.passed = false;
        result.violations.push(formulaResult.message);
        result.score = Math.min(result.score, formulaResult.score);
      }
    }

    // Generate suggestions
    if (!result.passed && config.suggestions) {
      result.suggestions = config.suggestions;
    }

    return result;
  }

  private evaluateCondition(
    condition: any,
    parameters: any,
  ): { passed: boolean; message: string } {
    const { parameter, operator, value, message } = condition;
    const actualValue = this.getNestedValue(parameters, parameter);

    if (actualValue === undefined || actualValue === null) {
      return {
        passed: false,
        message: message || `Parameter ${parameter} is missing`,
      };
    }

    let passed = false;

    switch (operator) {
      case '>=':
        passed = actualValue >= value;
        break;
      case '<=':
        passed = actualValue <= value;
        break;
      case '>':
        passed = actualValue > value;
        break;
      case '<':
        passed = actualValue < value;
        break;
      case '==':
      case '===':
        passed = actualValue == value;
        break;
      case '!=':
      case '!==':
        passed = actualValue != value;
        break;
      case 'in':
        passed = Array.isArray(value) && value.includes(actualValue);
        break;
      case 'not_in':
        passed = Array.isArray(value) && !value.includes(actualValue);
        break;
      default:
        passed = false;
    }

    return {
      passed,
      message: passed
        ? ''
        : message || `${parameter} (${actualValue}) does not satisfy ${operator} ${value}`,
    };
  }

  private evaluateFormula(
    formula: any,
    parameters: any,
  ): { passed: boolean; message: string; score: number } {
    try {
      const expression = formula.expression || formula;
      const minValue = formula.min_value || formula.minValue;
      const maxValue = formula.max_value || formula.maxValue;

      // Replace parameter names with actual values
      let evaluableExpression = expression;
      Object.keys(parameters).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        evaluableExpression = evaluableExpression.replace(regex, parameters[key] || 0);
      });

      // Evaluate using mathjs
      const result = math.evaluate(evaluableExpression);

      let passed = true;
      let message = '';
      let score = 100;

      if (minValue !== undefined && result < minValue) {
        passed = false;
        message = `Calculated value ${result} is less than minimum required ${minValue}`;
        score = (result / minValue) * 100;
      }

      if (maxValue !== undefined && result > maxValue) {
        passed = false;
        message = `Calculated value ${result} exceeds maximum allowed ${maxValue}`;
        score = (maxValue / result) * 100;
      }

      return { passed, message, score: Math.max(0, Math.min(100, score)) };
    } catch (error) {
      return {
        passed: false,
        message: `Formula evaluation error: ${error.message}`,
        score: 0,
      };
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
