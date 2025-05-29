import type {
  TableData,
  TableColumn,
  ClipboardData,
  AdapterOptions,
  CopyPasteCallbacks,
  ValidationResult,
} from '../types';
import { DataConverter } from '../utils/dataConverter';
import { ClipboardUtils } from '../utils/clipboard';
import { DataValidator } from '../utils/validator';

/**
 * Excel 表格适配器
 * 提供 Excel 和表格组件之间的数据交换功能
 */
export class ExcelTableAdapter {
  private options: AdapterOptions;
  private callbacks: CopyPasteCallbacks;
  private validator: DataValidator;

  constructor(
    options: AdapterOptions = {},
    callbacks: CopyPasteCallbacks = {}
  ) {
    this.options = {
      includeHeader: true,
      delimiter: '\t',
      rowDelimiter: '\n',
      ...options,
    };
    this.callbacks = callbacks;
    this.validator = new DataValidator();
  }

  /**
   * 从剪贴板粘贴数据到表格
   */
  async pasteFromClipboard(columns: TableColumn[]): Promise<TableData> {
    try {
      // 读取剪贴板数据
      let clipboardData = await ClipboardUtils.readClipboard();

      // 执行粘贴前回调
      if (this.callbacks.beforePaste) {
        clipboardData = await this.callbacks.beforePaste(clipboardData);
      }

      // 转换为表格数据
      const tableData = DataConverter.clipboardToTable(
        clipboardData,
        columns,
        this.options
      );

      // 数据验证
      const validationResult = this.validator.validate(tableData);
      if (!validationResult.valid) {
        console.warn('数据验证失败:', validationResult.errors);
      }

      // 执行粘贴后回调
      if (this.callbacks.afterPaste) {
        await this.callbacks.afterPaste(tableData);
      }

      return tableData;
    } catch (error) {
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * 复制表格数据到剪贴板
   */
  async copyToClipboard(tableData: TableData): Promise<void> {
    try {
      // 执行复制前回调
      let processedData = tableData;
      if (this.callbacks.beforeCopy) {
        processedData = await this.callbacks.beforeCopy(tableData);
      }

      // 转换为剪贴板格式
      const clipboardData = DataConverter.tableToClipboard(
        processedData,
        this.options
      );

      // 写入剪贴板
      await ClipboardUtils.writeClipboard(clipboardData);

      // 执行复制后回调
      if (this.callbacks.afterCopy) {
        await this.callbacks.afterCopy(processedData);
      }
    } catch (error) {
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * 从 Excel 文件导入数据
   */
  async importFromExcel(
    file: File,
    columns: TableColumn[]
  ): Promise<TableData> {
    try {
      const excelData = await this.parseExcelFile(file);
      const tableData = DataConverter.excelToTable(
        excelData,
        columns,
        this.options
      );

      // 数据验证
      const validationResult = this.validator.validate(tableData);
      if (!validationResult.valid) {
        console.warn('数据验证失败:', validationResult.errors);
      }

      return tableData;
    } catch (error) {
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * 导出表格数据到 Excel 文件
   */
  async exportToExcel(
    tableData: TableData,
    filename: string = 'export.xlsx'
  ): Promise<void> {
    try {
      // 执行复制前回调
      let processedData = tableData;
      if (this.callbacks.beforeCopy) {
        processedData = await this.callbacks.beforeCopy(tableData);
      }

      const excelData = DataConverter.tableToExcel(processedData, this.options);
      await this.downloadExcelFile(excelData, filename);

      // 执行复制后回调
      if (this.callbacks.afterCopy) {
        await this.callbacks.afterCopy(processedData);
      }
    } catch (error) {
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * 验证表格数据
   */
  validateData(tableData: TableData): ValidationResult {
    return this.validator.validate(tableData);
  }

  /**
   * 获取数据验证器
   */
  getValidator(): DataValidator {
    return this.validator;
  }

  /**
   * 更新配置选项
   */
  updateOptions(options: Partial<AdapterOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 更新回调函数
   */
  updateCallbacks(callbacks: Partial<CopyPasteCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * 检查剪贴板支持
   */
  static isClipboardSupported(): boolean {
    return ClipboardUtils.isClipboardSupported();
  }

  /**
   * 请求剪贴板权限
   */
  static async requestClipboardPermission(): Promise<boolean> {
    return ClipboardUtils.requestClipboardPermission();
  }

  /**
   * 解析 Excel 文件
   */
  private async parseExcelFile(file: File): Promise<any> {
    // 这里需要集成 Excel 解析库，如 xlsx
    // 为了保持核心库的轻量，这里提供一个基础实现
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // 简单的 CSV 解析实现
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const data = lines.map(line => line.split(','));
          
          resolve({
            sheets: [
              {
                name: 'Sheet1',
                data,
                headerRowIndex: this.options.includeHeader ? 0 : undefined,
              },
            ],
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }

  /**
   * 下载 Excel 文件
   */
  private async downloadExcelFile(
    excelData: any,
    filename: string
  ): Promise<void> {
    // 简单的 CSV 导出实现
    const sheet = excelData.sheets[0];
    if (!sheet) return;

    const csvContent = sheet.data
      .map((row: any[]) => row.map(cell => `"${cell || ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename.replace('.xlsx', '.csv'));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}