/**
 * 表格数据类型
 */
export interface TableData {
  /** 表格行数据 */
  rows: TableRow[];
  /** 表格列配置 */
  columns: TableColumn[];
}

/**
 * 表格行数据
 */
export interface TableRow {
  /** 行唯一标识 */
  id?: string | number;
  /** 行数据，键为列的 key */
  [key: string]: any;
}

/**
 * 表格列配置
 */
export interface TableColumn {
  /** 列唯一标识 */
  key: string;
  /** 列标题 */
  title: string;
  /** 数据类型 */
  dataType?: 'string' | 'number' | 'boolean' | 'date';
  /** 列宽度 */
  width?: number;
  /** 是否可编辑 */
  editable?: boolean;
}

/**
 * Excel 数据格式
 */
export interface ExcelData {
  /** 工作表数据 */
  sheets: ExcelSheet[];
}

/**
 * Excel 工作表
 */
export interface ExcelSheet {
  /** 工作表名称 */
  name: string;
  /** 工作表数据 */
  data: (string | number | boolean | null)[][];
  /** 表头行索引，默认为 0 */
  headerRowIndex?: number;
}

/**
 * 粘贴板数据格式
 */
export interface ClipboardData {
  /** 纯文本数据 */
  text: string;
  /** HTML 数据 */
  html?: string;
  /** 结构化数据 */
  structured?: (string | number | boolean | null)[][];
}

/**
 * 表格适配器接口
 */
export interface TableAdapter {
  /** 适配器名称 */
  name: string;
  /** 从表格组件获取数据 */
  getTableData(): TableData | Promise<TableData>;
  /** 设置表格组件数据 */
  setTableData(data: TableData): void | Promise<void>;
  /** 获取选中的数据 */
  getSelectedData?(): TableData | Promise<TableData>;
  /** 设置选中的数据 */
  setSelectedData?(data: TableData): void | Promise<void>;
}

/**
 * 适配器配置选项
 */
export interface AdapterOptions {
  /** 是否包含表头 */
  includeHeader?: boolean;
  /** 数据分隔符 */
  delimiter?: string;
  /** 行分隔符 */
  rowDelimiter?: string;
  /** 数据转换函数 */
  transform?: {
    /** 导出时的数据转换 */
    export?: (value: any, column: TableColumn) => string;
    /** 导入时的数据转换 */
    import?: (value: string, column: TableColumn) => any;
  };
}

/**
 * 复制粘贴事件回调
 */
export interface CopyPasteCallbacks {
  /** 复制前回调 */
  beforeCopy?: (data: TableData) => TableData | Promise<TableData>;
  /** 复制后回调 */
  afterCopy?: (data: TableData) => void | Promise<void>;
  /** 粘贴前回调 */
  beforePaste?: (data: ClipboardData) => ClipboardData | Promise<ClipboardData>;
  /** 粘贴后回调 */
  afterPaste?: (data: TableData) => void | Promise<void>;
  /** 错误处理回调 */
  onError?: (error: Error) => void;
}

/**
 * 数据验证规则
 */
export interface ValidationRule {
  /** 验证函数 */
  validator: (value: any, column: TableColumn) => boolean | string;
  /** 错误消息 */
  message?: string;
}

/**
 * 数据验证结果
 */
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean;
  /** 错误信息 */
  errors: ValidationError[];
}

/**
 * 验证错误信息
 */
export interface ValidationError {
  /** 行索引 */
  rowIndex: number;
  /** 列 key */
  columnKey: string;
  /** 错误消息 */
  message: string;
  /** 错误值 */
  value: any;
}