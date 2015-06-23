for %%f in (*.jpg) do (
	rename %~dp0%%f %%~nf-s%%~xf
)
