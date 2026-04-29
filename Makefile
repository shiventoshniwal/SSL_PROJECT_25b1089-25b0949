.PHONY: all clean

all: report.pdf

report.pdf: report.tex project.bib $(wildcard images/*)
	pdflatex report.tex
	bibtex report
	pdflatex report.tex
	pdflatex report.tex

clean:
	rm -f *.aux *.bbl *.blg *.log *.out *.toc *.lof *.lot
