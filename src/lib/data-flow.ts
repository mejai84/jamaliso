/**
 * JAMALI OS - DATA FLOW CORE
 * Engine para exportación e importación masiva de datos (CSV) 
 * con soporte para tipado estricto y validación de esquemas.
 */

export interface CSVColumn<T> {
    header: string;
    key: keyof T;
    transform?: (val: any) => string;
}

export class DataFlow {
    /**
     * Genera y descarga un archivo CSV desde una lista de objetos
     */
    static exportToCSV<T>(data: T[], columns: CSVColumn<T>[], filename: string) {
        if (!data.length) return;

        const headers = columns.map(c => c.header).join(',');
        const rows = data.map(item => {
            return columns.map(col => {
                let val = (item as any)[col.key]; // Cast to any to handle arbitrary T
                if (col.transform) val = col.transform(val);

                // Escapar comas y comillas para CSV
                const stringVal = String(val ?? '').replace(/"/g, '""');
                return `"${stringVal}"`;
            }).join(',');
        });

        const csvContent = "\uFEFF" + [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Parsea un archivo CSV subido por el usuario
     */
    static parseCSV(file: File): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    if (!text) return resolve([]);

                    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                    if (lines.length < 2) return resolve([]);

                    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
                    const data = lines.slice(1).map(line => {
                        // Regex para separar por comas respetando comillas
                        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                        const obj: any = {};
                        headers.forEach((header, i) => {
                            const val = values[i] ? values[i].replace(/^"|"$/g, '').trim() : '';
                            obj[header] = val;
                        });
                        return obj;
                    });
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Valida si los headers de un CSV coinciden con lo esperado
     */
    static validateHeaders(parsedData: any[], requiredHeaders: string[]): boolean {
        if (!parsedData.length) return false;
        const headers = Object.keys(parsedData[0]);
        return requiredHeaders.every(rh => headers.includes(rh));
    }
}
