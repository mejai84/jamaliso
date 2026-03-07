export function numeroALetras(num: number): string {
    const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    if (num === 0) return 'CERO PESOS';
    if (num === 100) return 'CIEN PESOS';

    function convertir(n: number): string {
        if (n < 10) return unidades[n];
        if (n < 20) return especiales[n - 10];
        if (n < 100) {
            const d = Math.floor(n / 10);
            const u = n % 10;
            return u === 0 ? decenas[d] : `${decenas[d]} Y ${unidades[u]}`;
        }
        if (n < 1000) {
            const c = Math.floor(n / 100);
            const r = n % 100;
            if (n === 100) return 'CIEN';
            return r === 0 ? centenas[c] : `${centenas[c]} ${convertir(r)}`;
        }
        if (n < 1000000) {
            const m = Math.floor(n / 1000);
            const r = n % 1000;
            const mil = m === 1 ? 'MIL' : `${convertir(m)} MIL`;
            return r === 0 ? mil : `${mil} ${convertir(r)}`;
        }
        return 'VALOR MUY ALTO';
    }

    return `${convertir(num)} PESOS M/CTE`.toUpperCase();
}

export const handlePrint = (voucher: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Comprobante de Caja Menor - #${voucher.voucher_number}</title>
            <style>
                body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #000; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .label { font-weight: bold; }
                .signature-box { border: 1px solid #000; height: 100px; margin-top: 30px; position: relative; }
                .signature-label { position: absolute; bottom: 5px; left: 5px; font-size: 10px; }
                .signature-img { max-height: 80px; display: block; margin: 10px auto; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>COMPROBANTE DE CAJA MENOR</h1>
                <h2># ${voucher.voucher_number}</h2>
            </div>
            <div class="row">
                <span><span class="label">Fecha:</span> ${voucher.date}</span>
                <span><span class="label">Valor:</span> $${voucher.amount.toLocaleString('es-CO')}</span>
            </div>
            <div class="row">
                <span><span class="label">Pagado a:</span> ${voucher.beneficiary_name}</span>
            </div>
            <div class="row">
                <span><span class="label">Concepto:</span> ${voucher.concept}</span>
            </div>
            <div class="row">
                <span><span class="label">Categoría:</span> ${voucher.category || 'Otros'}</span>
            </div>
            <div class="row" style="margin-top: 20px;">
                <span><span class="label">Cantidad en letras:</span> ${voucher.amount_in_words}</span>
            </div>
            <div class="signature-box">
                ${voucher.signature_data ? `<img src="${voucher.signature_data}" class="signature-img" />` : ''}
                <span class="signature-label">Firma del Beneficiario</span>
            </div>
            <div style="margin-top: 20px; text-align: center; font-size: 10px;">
                Comprobante generado por JAMALI OS Intelligence
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}
