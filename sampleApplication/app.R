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

# Define UI for application that draws a histogram
ui <- fluidPage(

   # Application title
   titlePanel("Sequence Viewer"),

   # Show a plot of the generated distribution
   mainPanel(
     textInput("uniprot", "UniProtID", "Q14112"),
     sliderInput("range", "Amino acids", 1, 1, c(1,1), step = 1, round = FALSE, ticks = TRUE, animate = FALSE),
     SeqViewer(list(ptms=T,domains=T),elementId="sequence")
   )
)

# Define server logic required to draw a histogram
server <- function(input, output,session) {
  observe({
    showRange('sequence',input$range[1],input$range[2])
  })

  observeEvent(input$sequenceChange,{
    updateSliderInput(session,"range",value=c(1,nchar(input$sequenceChange)),min=1,max=nchar(input$sequenceChange),step=1)
    showData('sequence',data.frame(acc=input$uniprot,peptide_start=sample(1:100,50,replace=T),peptide_end=sample(200:300,50,replace=T),composition=rep('HexNAc',10)))
  })
  observe({
    showData('sequence',input$dataframe)
  })
  observe({
    setUniprot('sequence',input$uniprot)
  })
}

# Run the application
shinyApp(ui = ui, server = server)

