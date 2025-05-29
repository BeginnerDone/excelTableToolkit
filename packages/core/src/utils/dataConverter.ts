import type {
  TableData,
  TableRow,
  TableColumn,
  ExcelData,
  ExcelSheet,
  ClipboardData,
  AdapterOptions,
} from '../types';

/**
 * 数据转换工具类
 */
export class DataConverter {
  /**
   * 将表格数据转换为 Excel 格式
   */
  static tableToExcel(
    tableData: TableData,
    options: AdapterOptions = {}
  ): ExcelData {
    const { includeHeader = true } = options;
    const { rows, columns } = tableData;

    const data: (string | number | boolean | null)[][] = [];

    // 添加表头
    if (includeHeader) {
      data.push(columns.map(col => col.title));
    }

    // 添加数据行
    rows.forEach(row => {
      const rowData = columns.map(col => {
        const value = row[col.key];
        return this.formatCellValue(value, col, options);
      });
      data.push(rowData);
    });

    return {
      sheets: [
        {
          name: 'Sheet1',
          data,
          headerRowIndex: includeHeader ? 0 : undefined,
        },
      ],
    };
  }

  /**
   * 将 Excel 数据转换为表格格式
   */
  static excelToTable(
    excelData: ExcelData,
    columns: TableColumn[],
    options: AdapterOptions = {}
  ): TableData {
    const { includeHeader = true } = options;
    const sheet = excelData.sheets[0];
    if (!sheet || !sheet.data.length) {
      return { rows: [], columns };
    }

    const { data } = sheet;
    const startRowIndex = includeHeader ? 1 : 0;
    const rows: TableRow[] = [];

    for (let i = startRowIndex; i < data.length; i++) {
      const rowData = data[i];
      const row: TableRow = { id: i };

      columns.forEach((col, colIndex) => {
        const cellValue = rowData[colIndex];
        row[col.key] = this.parseCellValue(cellValue, col, options);
      });

      rows.push(row);
    }

    return { rows, columns };
  }

  /**
   * 将表格数据转换为剪贴板格式
   */
  static tableToClipboard(
    tableData: TableData,
    options: AdapterOptions = {}
  ): ClipboardData {
    const { delimiter = '\t', rowDelimiter = '\n', includeHeader = true } = options;
    const { rows, columns } = tableData;

    const lines: string[] = [];

    // 添加表头
    if (includeHeader) {
      lines.push(columns.map(col => col.title).join(delimiter));
    }

    // 添加数据行
    rows.forEach(row => {
      const rowData = columns.map(col => {
        const value = row[col.key];
        return this.formatCellValue(value, col, options)?.toString() || '';
      });
      lines.push(rowData.join(delimiter));
    });

    const text = lines.join(rowDelimiter);
    const structured = this.parseStructuredData(text, delimiter, rowDelimiter);

    return {
      text,
      structured,
    };
  }

  /**
   * 将剪贴板数据转换为表格格式
   */
  static clipboardToTable(
    clipboardData: ClipboardData,
    columns: TableColumn[],
    options: AdapterOptions = {}
  ): TableData {
    const { delimiter = '\t', rowDelimiter = '\n', includeHeader = true } = options;
    
    let data: (string | number | boolean | null)[][];
    
    if (clipboardData.structured) {
      data = clipboardData.structured;
    } else {
      data = this.parseStructuredData(clipboardData.text, delimiter, rowDelimiter);
    }

    if (!data.length) {
      return { rows: [], columns };
    }

    const startRowIndex = includeHeader ? 1 : 0;
    const rows: TableRow[] = [];

    for (let i = startRowIndex; i < data.length; i++) {
      const rowData = data[i];
      const row: TableRow = { id: i };

      columns.forEach((col, colIndex) => {
        const cellValue = rowData[colIndex];
        row[col.key] = this.parseCellValue(cellValue, col, options);
      });

      rows.push(row);
    }

    return { rows, columns };
  }

  /**
   * 格式化单元格值（用于导出）
   */
  private static formatCellValue(
    value: any,
    column: TableColumn,
    options: AdapterOptions
  ): string | number | boolean | null {
    if (value == null) return null;

    // 使用自定义转换函数
    if (options.transform?.export) {
      return options.transform.export(value, column) as any;
    }

    // 根据数据类型进行转换
    switch (column.dataType) {
      case 'number':
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      case 'boolean':
        return Boolean(value);
      case 'date':
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        return String(value);
      default:
        return String(value);
    }
  }

  /**
   * 解析单元格值（用于导入）
   */
  private static parseCellValue(
    value: any,
    column: TableColumn,
    options: AdapterOptions
  ): any {
    if (value == null || value === '') return null;

    // 使用自定义转换函数
    if (options.transform?.import) {
      return options.transform.import(String(value), column);
    }

    // 根据数据类型进行转换
    switch (column.dataType) {
      case 'number': {
        const num = parseFloat(String(value));
        return isNaN(num) ? null : num;
      }
      case 'boolean':
        return String(value).toLowerCase() === 'true';
      case 'date':
        return new Date(String(value));
      default:
        return String(value);
    }
  }

  /**
   * 解析结构化数据
   */
  private static parseStructuredData(
    text: string,
    delimiter: string,
    rowDelimiter: string
  ): (string | number | boolean | null)[][] {
    if (!text.trim()) return [];

    return text
      .split(rowDelimiter)
      .filter(line => line.trim())
      .map(line => 
        line.split(delimiter).map(cell => {
          const trimmed = cell.trim();
          
          // 尝试解析为数字
          if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            return parseFloat(trimmed);
          }
          
          // 尝试解析为布尔值
          if (trimmed.toLowerCase() === 'true') return true;
          if (trimmed.toLowerCase() === 'false') return false;
          
          // 空值处理
          if (trimmed === '') return null;
          
          return trimmed;
        })
      );
  }
}