param(
    [string]$OutputPath = (Join-Path $PSScriptRoot '..\models\calibration-plaque.stl')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$triangles = [System.Collections.Generic.List[object]]::new()

function Add-Triangle {
    param([double[]]$A, [double[]]$B, [double[]]$C)
    $triangles.Add([object]@($A, $B, $C))
}

function Add-Box {
    param([double]$X, [double]$Y, [double]$Z, [double]$Width, [double]$Depth, [double]$Height)

    $v = @(
        @($X, $Y, $Z), @(($X + $Width), $Y, $Z),
        @(($X + $Width), ($Y + $Depth), $Z), @($X, ($Y + $Depth), $Z),
        @($X, $Y, ($Z + $Height)), @(($X + $Width), $Y, ($Z + $Height)),
        @(($X + $Width), ($Y + $Depth), ($Z + $Height)), @($X, ($Y + $Depth), ($Z + $Height))
    )

    $faces = @(
        @(0,2,1), @(0,3,2), @(4,5,6), @(4,6,7),
        @(0,1,5), @(0,5,4), @(1,2,6), @(1,6,5),
        @(2,3,7), @(2,7,6), @(3,0,4), @(3,4,7)
    )
    foreach ($face in $faces) {
        Add-Triangle -A $v[$face[0]] -B $v[$face[1]] -C $v[$face[2]]
    }
}

function Add-Cylinder {
    param([double]$CenterX, [double]$CenterY, [double]$Z, [double]$Radius, [double]$Height, [int]$Segments = 48)
    $bottomCenter = @($CenterX, $CenterY, $Z)
    $topCenter = @($CenterX, $CenterY, ($Z + $Height))
    for ($i = 0; $i -lt $Segments; $i++) {
        $a0 = 2 * [Math]::PI * $i / $Segments
        $a1 = 2 * [Math]::PI * ($i + 1) / $Segments
        $b0 = @(($CenterX + $Radius * [Math]::Cos($a0)), ($CenterY + $Radius * [Math]::Sin($a0)), $Z)
        $b1 = @(($CenterX + $Radius * [Math]::Cos($a1)), ($CenterY + $Radius * [Math]::Sin($a1)), $Z)
        $t0 = @($b0[0], $b0[1], ($Z + $Height))
        $t1 = @($b1[0], $b1[1], ($Z + $Height))
        Add-Triangle -A $bottomCenter -B $b1 -C $b0
        Add-Triangle -A $topCenter -B $t0 -C $t1
        Add-Triangle -A $b0 -B $b1 -C $t1
        Add-Triangle -A $b0 -B $t1 -C $t0
    }
}

# 100 x 60 x 2 mm plaque.
Add-Box -X 0 -Y 0 -Z 0 -Width 100 -Depth 60 -Height 2

# Raised block letters "HI", 1 mm above the plaque.
Add-Box -X 18 -Y 19 -Z 2 -Width 4 -Depth 22 -Height 1
Add-Box -X 34 -Y 19 -Z 2 -Width 4 -Depth 22 -Height 1
Add-Box -X 22 -Y 28 -Z 2 -Width 12 -Depth 4 -Height 1
Add-Box -X 45 -Y 19 -Z 2 -Width 4 -Depth 22 -Height 1

# Raised plus and circular symbols for testing painted top surfaces.
Add-Box -X 61 -Y 28 -Z 2 -Width 18 -Depth 4 -Height 1
Add-Box -X 68 -Y 21 -Z 2 -Width 4 -Depth 18 -Height 1
Add-Cylinder -CenterX 89 -CenterY 30 -Z 2 -Radius 6 -Height 1 -Segments 48

$target = [System.IO.Path]::GetFullPath($OutputPath)
$targetDirectory = [System.IO.Path]::GetDirectoryName($target)
[System.IO.Directory]::CreateDirectory($targetDirectory) | Out-Null
$writer = [System.IO.StreamWriter]::new($target, $false, [System.Text.Encoding]::ASCII)
try {
    $writer.WriteLine('solid calibration_plaque')
    foreach ($triangle in $triangles) {
        $writer.WriteLine('  facet normal 0 0 0')
        $writer.WriteLine('    outer loop')
        foreach ($vertex in $triangle) {
            $writer.WriteLine(('      vertex {0:R} {1:R} {2:R}' -f $vertex[0], $vertex[1], $vertex[2]))
        }
        $writer.WriteLine('    endloop')
        $writer.WriteLine('  endfacet')
    }
    $writer.WriteLine('endsolid calibration_plaque')
}
finally {
    $writer.Dispose()
}

Write-Output "Generated $target with $($triangles.Count) triangles."
