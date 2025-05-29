// 类型定义
export type {
  TableData,
  TableRow,
  TableColumn,
  ExcelData,
  ExcelSheet,
  ClipboardData,
  TableAdapter,
  AdapterOptions,
  CopyPasteCallbacks,
  ValidationRule,
  ValidationResult,
  ValidationError,
} from './types';

// 核心适配器
export { ExcelTableAdapter } from './adapters/ExcelTableAdapter';
export { BaseTableAdapter } from './adapters/BaseTableAdapter';
export { NativeTableAdapter } from './adapters/NativeTableAdapter';

// 工具类
export { DataConverter } from './utils/dataConverter';
export { ClipboardUtils } from './utils/clipboard';
export { DataValidator } from './utils/validator';

// 工厂函数
export {
  createTableAdapter,
  createExcelAdapter,
  registerAdapter,
  getRegisteredAdapter,
  getRegisteredAdapterNames,
  isAdapterRegistered,
} from './factory';
export type { AdapterConfig } from './factory';

// 默认导出
export { ExcelTableAdapter as default } from './adapters/ExcelTableAdapter';

// 版本信息
export const version = '1.0.0';

// 便捷函数
/**
 * 快速创建原生表格适配器
 */
export function createNativeTableAdapter(
  tableElement: HTMLTableElement,
  columns: import('./types').TableColumn[],
  options?: import('./types').AdapterOptions
) {
  return createTableAdapter({
    type: 'native',
    target: tableElement,
    columns,
    options,
  });
}

/**
 * 快速创建 Ant Design Vue 表格适配器
 */
export function createAntDesignVueTableAdapter(
  tableRef: any,
  columns: import('./types').TableColumn[],
  options?: import('./types').AdapterOptions,
  callbacks?: import('./types').CopyPasteCallbacks
) {
  return createTableAdapter({
    type: 'ant-design-vue',
    target: tableRef,
    columns,
    options,
    callbacks,
  });
}

/**
 * 快速创建 Element Plus 表格适配器
 */
export function createElementPlusTableAdapter(
  tableRef: any,
  columns: import('./types').TableColumn[],
  options?: import('./types').AdapterOptions,
  callbacks?: import('./types').CopyPasteCallbacks
) {
  return createTableAdapter({
    type: 'element-plus',
    target: tableRef,
    columns,
    options,
    callbacks,
  });
}

/**
 * 创建数据验证器实例
 */
export function createValidator() {
  return new DataValidator();
}

/**
 * 获取常用验证规则
 */
export function getCommonValidationRules() {
  return DataValidator.createCommonRules();
}

/**
 * 检查浏览器兼容性
 */
export function checkBrowserCompatibility() {
  return {
    clipboardAPI: ClipboardUtils.isClipboardSupported(),
    fileAPI: typeof FileReader !== 'undefined',
    blobAPI: typeof Blob !== 'undefined',
    urlAPI: typeof URL !== 'undefined',
  };
}

/**
 * 初始化库（可选）
 */
export function init(config?: {
  /** 是否自动请求剪贴板权限 */
  autoRequestClipboardPermission?: boolean;
  /** 全局错误处理函数 */
  globalErrorHandler?: (error: Error) => void;
}) {
  const { autoRequestClipboardPermission = false, globalErrorHandler } = config || {};

  // 设置全局错误处理
  if (globalErrorHandler) {
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason instanceof Error) {
        globalErrorHandler(event.reason);
      }
    });
  }

  // 自动请求剪贴板权限
  if (autoRequestClipboardPermission) {
    ClipboardUtils.requestClipboardPermission().catch(() => {
      console.warn('Failed to request clipboard permission');
    });
  }

  return {
    version,
    compatibility: checkBrowserCompatibility(),
  };
}