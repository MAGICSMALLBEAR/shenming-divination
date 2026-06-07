Add-Type -AssemblyName System.Drawing

$typeDefinition = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class GodImageDeriver
{
    public static void SaveSoft(string inputPath, string outputPath, int featherPx)
    {
        using (var sourceOriginal = new Bitmap(inputPath))
        using (var source = new Bitmap(sourceOriginal.Width, sourceOriginal.Height, PixelFormat.Format32bppArgb))
        {
            using (var copyGraphics = Graphics.FromImage(source))
            {
                copyGraphics.DrawImage(sourceOriginal, 0, 0, sourceOriginal.Width, sourceOriginal.Height);
            }

            var rect = new Rectangle(0, 0, source.Width, source.Height);
            var data = source.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);

            try
            {
                int stride = data.Stride;
                int bytes = stride * data.Height;
                byte[] buffer = new byte[bytes];
                Marshal.Copy(data.Scan0, buffer, 0, bytes);

                int maxX = source.Width - 1;
                int maxY = source.Height - 1;

                for (int y = 0; y < source.Height; y++)
                {
                    for (int x = 0; x < source.Width; x++)
                    {
                        int idx = (y * stride) + (x * 4);
                        byte alpha = buffer[idx + 3];
                        if (alpha == 0)
                        {
                            continue;
                        }

                        int edgeDistance = Math.Min(Math.Min(x, maxX - x), Math.Min(y, maxY - y));
                        if (edgeDistance >= featherPx)
                        {
                            continue;
                        }

                        double t = Math.Max(0.0, Math.Min(1.0, (double)edgeDistance / featherPx));
                        double smooth = t * t * (3.0 - (2.0 * t));
                        buffer[idx + 3] = (byte)Math.Max(0, Math.Min(255, (int)Math.Round(alpha * smooth)));
                    }
                }

                Marshal.Copy(buffer, 0, data.Scan0, bytes);
            }
            finally
            {
                source.UnlockBits(data);
            }

            source.Save(outputPath, ImageFormat.Png);
        }
    }

    public static void SaveCloseup(string inputPath, string outputPath, int cropTop, double cropWidthRatio, int outputWidth, int outputHeight)
    {
        using (var sourceOriginal = new Bitmap(inputPath))
        using (var output = new Bitmap(outputWidth, outputHeight, PixelFormat.Format32bppArgb))
        using (var graphics = Graphics.FromImage(output))
        {
            graphics.Clear(Color.Transparent);
            graphics.CompositingQuality = CompositingQuality.HighQuality;
            graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
            graphics.SmoothingMode = SmoothingMode.HighQuality;
            graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;

            int cropWidth = Math.Min(sourceOriginal.Width, (int)Math.Round(sourceOriginal.Width * cropWidthRatio));
            int cropHeight = Math.Min(sourceOriginal.Height, (int)Math.Round(cropWidth * (outputHeight / (double)outputWidth)));
            int cropLeft = Math.Max(0, (sourceOriginal.Width - cropWidth) / 2);
            int safeTop = Math.Max(0, Math.Min(cropTop, sourceOriginal.Height - cropHeight));

            var sourceRect = new Rectangle(cropLeft, safeTop, cropWidth, cropHeight);
            var outputRect = new Rectangle(0, 0, outputWidth, outputHeight);

            graphics.DrawImage(sourceOriginal, outputRect, sourceRect, GraphicsUnit.Pixel);
            output.Save(outputPath, ImageFormat.Png);
        }
    }
}
"@

Add-Type -TypeDefinition $typeDefinition -ReferencedAssemblies System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$cardDir = Join-Path $root 'assets\images\gods\generated\cards'
$softDir = Join-Path $root 'assets\images\gods\generated\soft'
$closeupDir = Join-Path $root 'assets\images\gods\generated\closeups'

New-Item -ItemType Directory -Force -Path $softDir | Out-Null
New-Item -ItemType Directory -Force -Path $closeupDir | Out-Null

function Test-DerivedImageCurrent {
  param(
    [Parameter(Mandatory=$true)][string]$SourcePath,
    [Parameter(Mandatory=$true)][string]$OutputPath,
    [Parameter(Mandatory=$true)][int]$ExpectedWidth,
    [Parameter(Mandatory=$true)][int]$ExpectedHeight
  )

  if (-not (Test-Path $OutputPath)) {
    return $false
  }

  try {
    $image = [System.Drawing.Image]::FromFile($OutputPath)
    if ($image.Width -ne $ExpectedWidth -or $image.Height -ne $ExpectedHeight) {
      return $false
    }
  }
  finally {
    if ($image) {
      $image.Dispose()
    }
  }

  $sourceItem = Get-Item $SourcePath
  $outputItem = Get-Item $OutputPath
  return $outputItem.LastWriteTimeUtc -ge $sourceItem.LastWriteTimeUtc
}

$cropTopBySlug = @{
  'baoshengdadi' = 140
  'chenghuangye' = 128
  'fudezhengshen' = 150
  'guanshengdijun' = 132
  'guanyin' = 120
  'jigonghuofo' = 118
  'lvdongbin' = 126
  'mazu' = 128
  'santaizi' = 120
  'wangye' = 126
  'wenchangdijun' = 128
  'xuantianshangdi' = 126
  'yuexialaoren' = 118
  'zhugewuhou' = 132
  'zhushengniangniang' = 118
}

foreach ($cardFile in Get-ChildItem $cardDir -Filter '*-card.png') {
  $slug = $cardFile.BaseName -replace '-card$', ''
  $softPath = Join-Path $softDir "$slug-soft.png"
  $closeupPath = Join-Path $closeupDir "$slug-closeup.png"
  $cropTop = if ($cropTopBySlug.ContainsKey($slug)) { [int]$cropTopBySlug[$slug] } else { 128 }

  try {
    $cardImage = [System.Drawing.Image]::FromFile($cardFile.FullName)
    $cardWidth = $cardImage.Width
    $cardHeight = $cardImage.Height
  }
  finally {
    if ($cardImage) {
      $cardImage.Dispose()
    }
  }

  if (-not (Test-DerivedImageCurrent $cardFile.FullName $softPath $cardWidth $cardHeight)) {
    [GodImageDeriver]::SaveSoft($cardFile.FullName, $softPath, 150)
    Write-Output "soft:$slug"
  }

  if (-not (Test-DerivedImageCurrent $cardFile.FullName $closeupPath 1024 1280)) {
    [GodImageDeriver]::SaveCloseup($cardFile.FullName, $closeupPath, $cropTop, 0.8, 1024, 1280)
    Write-Output "closeup:$slug"
  }
}
