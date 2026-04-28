.PHONY: all clean

all:
	pdflatex report.tex
	bibtex report
	pdflatex report.tex
	pdflatex report.tex

clean:
	rm -f *.aux *.bbl *.blg *.log *.out *.toc *.lof *.lot
