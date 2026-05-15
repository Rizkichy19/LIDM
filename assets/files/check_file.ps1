try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zipPath = 'D:\Kuliah\LIDM\assets\files\SOAL REVISI DIAGNOSTIK & UJIKOM.pdf'
    Write-Host "File exists: $(Test-Path $zipPath)"
    Write-Host "Trying PDF path: $zipPath"
} catch {
    Write-Host "Error: $_"
}

# The file is a PDF, not DOCX. Let's try iTextSharp or just read the PDF as binary and look for text.
# Alternative: copy and rename to .zip then extract
$pdfPath = 'D:\Kuliah\LIDM\assets\files\SOAL REVISI DIAGNOSTIK & UJIKOM.pdf'
Write-Host "File size: $((Get-Item $pdfPath).Length) bytes"
