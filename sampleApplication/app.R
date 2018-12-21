#
# This is a Shiny web application. You can run the application by clicking
# the 'Run App' button above.
#
# Find out more about building applications with Shiny here:
#
#    http://shiny.rstudio.com/
#

library(shiny)
library(shinyGator)
library(ggplot2)

# Define UI for application that draws a histogram
ui <- fluidPage(

   # Application title
   titlePanel("Sequence Viewer"),

   # Show a plot of the generated distribution
   mainPanel(
     textInput("uniprot", "UniProtID", "Q14112"),
     textInput("uniprot2", "UniProtID", "Q14118"),     
     sliderInput("range", "Amino acids", 1, 1, c(1,1), step = 1, round = FALSE, ticks = TRUE, animate = FALSE),
     SeqViewer(list(ptms=T,domains=T,interactive=T),elementId="sequence"),
     SeqViewer(list(ptms=T,domains=T,interactive=T),elementId="sequence2")

   )
)

dataset = rbind(
            data.frame(a=sample(100:200,10),b=sample(201:300,10),uniprot=rep('Q14112',10)),
            data.frame(a=sample(250:300,10),b=sample(301:350,10),uniprot=rep('Q14118',10))
          )

# Define server logic required to draw a histogram
server <- function(input, output,session) {
  observe({
    showRange('sequence',input$range[1],input$range[2])
  })

  observeEvent(input$pan_sequence,{
    updateSliderInput(session,"range",value=c(input$pan_sequence$left,input$pan_sequence$right),min=1,max=nchar(input$sequenceChange_sequence),step=1)
  })

  data <- reactive({
    subset(dataset, uniprot == input$uniprot)
  })

  observeEvent(input$sequenceChange_sequence,{
    updateSliderInput(session,"range",value=c(1,nchar(input$sequenceChange_sequence)),min=1,max=nchar(input$sequenceChange_sequence),step=1)
    dataframe = data()
    if (nrow(dataframe) > 0) {
      #addTrack('sequence',data.frame(peptide_start=sample(1:100,50,replace=T),peptide_end=sample(200:300,50,replace=T),composition=rep('HexNAc',10)))

      peptides('sequence',data=data(),mapping=aes(peptide.start=a,peptide.end=b,composition='HexNAc',size=7,color='red',alpha=0.5))
    }
    #addTrack('sequence',data.frame(peptide_start=sample(1:100,50,replace=T),peptide_end=sample(200:300,50,replace=T),composition=rep('HexNAc',10)))
    #sites('sequence', data.frame(a=sample(1:500,10)), aes(sites=a,composition='HexNAc'))

  })

  observe({
    setUniprot('sequence',input$uniprot)
  })
  observe({
    setUniprot('sequence2',input$uniprot2)
  })

}

# Run the application
shinyApp(ui = ui, server = server)

