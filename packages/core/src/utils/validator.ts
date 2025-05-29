import type {
  TableData,
  TableColumn,
  ValidationRule,
  ValidationResult,
  ValidationError,
} from '../types';

/**
 * 数据验证工具类
 */
export class DataValidator {
  private rules: Map<string, ValidationRule[]> = new Map();

  /**
   * 添加验证规则
   */
  addRule(columnKey: string, rule: ValidationRule): void {
    if (!this.rules.has(columnKey)) {
      this.rules.set(columnKey, []);
    }
    this.rules.get(columnKey)!.push(rule);
  }

  /**
   * 移除验证规则
   */
  removeRule(columnKey: string, rule?: ValidationRule): void {
    if (!rule) {
      this.rules.delete(columnKey);
      return;
    }

    const rules = this.rules.get(columnKey);
    if (rules) {
      const index = rules.indexOf(rule);
      if (index > -1) {
        rules.splice(index, 1);
      }
    }
  }

  /**
   * 验证表格数据
   */
  validate(tableData: TableData): ValidationResult {
    const errors: ValidationError[] = [];
    const { rows, columns } = tableData;

    rows.forEach((row, rowIndex) => {
      columns.forEach(column => {
        const value = row[column.key];
        const columnRules = this.rules.get(column.key) || [];

        // 内置验证规则
        const builtInErrors = this.validateBuiltInRules(value, column, rowIndex);
        errors.push(...builtInErrors);

        // 自定义验证规则
        columnRules.forEach(rule => {
          const result = rule.validator(value, column);
          if (result !== true) {
            errors.push({
              rowIndex,
              columnKey: column.key,
              message: typeof result === 'string' ? result : rule.message || '验证失败',
              value,
            });
          }
        });
      });
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证单个值
   */
  validateValue(
    value: any,
    column: TableColumn,
    rowIndex: number = 0
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // 内置验证规则
    const builtInErrors = this.validateBuiltInRules(value, column, rowIndex);
    errors.push(...builtInErrors);

    // 自定义验证规则
    const columnRules = this.rules.get(column.key) || [];
    columnRules.forEach(rule => {
      const result = rule.validator(value, column);
      if (result !== true) {
        errors.push({
          rowIndex,
          columnKey: column.key,
          message: typeof result === 'string' ? result : rule.message || '验证失败',
          value,
        });
      }
    });

    return errors;
  }

  /**
   * 内置验证规则
   */
  private validateBuiltInRules(
    value: any,
    column: TableColumn,
    rowIndex: number
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // 数据类型验证
    if (value != null && column.dataType) {
      const typeError = this.validateDataType(value, column.dataType);
      if (typeError) {
        errors.push({
          rowIndex,
          columnKey: column.key,
          message: typeError,
          value,
        });
      }
    }

    return errors;
  }

  /**
   * 验证数据类型
   */
  private validateDataType(value: any, dataType: string): string | null {
    switch (dataType) {
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          return '必须是有效的数字';
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean' && 
            !['true', 'false', '1', '0'].includes(String(value).toLowerCase())) {
          return '必须是布尔值';
        }
        break;
      case 'date':
        if (!(value instanceof Date) && isNaN(Date.parse(String(value)))) {
          return '必须是有效的日期';
        }
        break;
      case 'string':
        // 字符串类型比较宽松，大部分值都可以转换为字符串
        break;
    }
    return null;
  }

  /**
   * 清空所有验证规则
   */
  clearRules(): void {
    this.rules.clear();
  }

  /**
   * 获取指定列的验证规则
   */
  getRules(columnKey: string): ValidationRule[] {
    return this.rules.get(columnKey) || [];
  }

  /**
   * 创建常用验证规则
   */
  static createCommonRules() {
    return {
      /**
       * 必填验证
       */
      required: (message = '此字段为必填项'): ValidationRule => ({
        validator: (value: any) => {
          return value != null && String(value).trim() !== '';
        },
        message,
      }),

      /**
       * 最小长度验证
       */
      minLength: (min: number, message?: string): ValidationRule => ({
        validator: (value: any) => {
          const str = String(value || '');
          return str.length >= min;
        },
        message: message || `最少需要 ${min} 个字符`,
      }),

      /**
       * 最大长度验证
       */
      maxLength: (max: number, message?: string): ValidationRule => ({
        validator: (value: any) => {
          const str = String(value || '');
          return str.length <= max;
        },
        message: message || `最多允许 ${max} 个字符`,
      }),

      /**
       * 数值范围验证
       */
      range: (min: number, max: number, message?: string): ValidationRule => ({
        validator: (value: any) => {
          const num = Number(value);
          return !isNaN(num) && num >= min && num <= max;
        },
        message: message || `数值必须在 ${min} 到 ${max} 之间`,
      }),

      /**
       * 正则表达式验证
       */
      pattern: (regex: RegExp, message = '格式不正确'): ValidationRule => ({
        validator: (value: any) => {
          return regex.test(String(value || ''));
        },
        message,
      }),

      /**
       * 邮箱验证
       */
      email: (message = '请输入有效的邮箱地址'): ValidationRule => ({
        validator: (value: any) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(String(value || ''));
        },
        message,
      }),

      /**
       * 手机号验证
       */
      phone: (message = '请输入有效的手机号'): ValidationRule => ({
        validator: (value: any) => {
          const phoneRegex = /^1[3-9]\d{9}$/;
          return phoneRegex.test(String(value || ''));
        },
        message,
      }),

      /**
       * 自定义验证函数
       */
      custom: (
        validator: (value: any, column: TableColumn) => boolean | string,
        message = '验证失败'
      ): ValidationRule => ({
        validator,
        message,
      }),
    };
  }
}