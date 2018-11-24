#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
SeqViewer <- function(message=list(), width = NULL, height = NULL, elementId = NULL) {

  # forward options using x
  x = list(
    message = message
  )

  x$api <- list()

  # create widget
  widget = htmlwidgets::createWidget(
    name = 'SeqViewer',
    x,
    width = width,
    height = height,
    package = 'shinyGator',
    elementId = elementId
  )
}

callJS <- function(method) {
  message <- Filter(function(x) !is.symbol(x), as.list(parent.frame(1)))
  session <- shiny::getDefaultReactiveDomain()
  method <- paste0("seqviewer:", method)
  message$method = method

  input_id = message$id

  if ( is.null(session) || methods::is(input_id,'SeqViewer') ) {
    message$id = NULL
    input_id$x$api = c( input_id$x$api, list(message))
  } else {
    session$sendCustomMessage(method, message)
  }
  input_id
}

setUniprot <- function(id,uniprot) {
  callJS('setUniprot')
}

showRange <- function(id,min,max) {
  callJS('showRange')
}

addTrack <- function(id,dataframe,track='data') {
  callJS('addTrack')
}

peptides <- function(id,data,mapping,track='data') {
  dataframe = data.frame(
    peptide_start=with(data,eval(mapping[['peptide.start']])),
    peptide_end=with(data,eval(mapping[['peptide.end']])),
    composition=with(data,eval(mapping[['composition']]))
  )
  callJS('addTrack')
}

sites <- function(id,data,mapping,track='data') {
  dataframe = `class<-`(list(sites=list(with(data, mapply(list, eval(mapping[['sites']]),eval(mapping[['composition']]), SIMPLIFY =F)))), 'data.frame')
  callJS('addTrack')
}


#' Shiny bindings for SeqViewer
#'
#' Output and render functions for using SeqViewer within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a SeqViewer
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name SeqViewer-shiny
#'
#' @export
SeqViewerOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'SeqViewer', width, height, package = 'shinyGator')
}

#' @rdname SeqViewer-shiny
#' @export
renderSeqViewer <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, SeqViewerOutput, env, quoted = TRUE)
}
