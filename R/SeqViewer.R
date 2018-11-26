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

compact = function(l) {
  Filter(Negate(is.null), l)
}

empty = function (df) {
    (is.null(df) || nrow(df) == 0 || ncol(df) == 0)
}

use_default_aes = function(default,data) {
  missing_aes <- setdiff(names(default), names(data))

  missing_eval <- lapply(default[missing_aes], rlang::eval_tidy)

  # Needed for geoms with defaults set to NULL (e.g. GeomSf)

  missing_eval <- compact(missing_eval)

  if (empty(data)) {
    data <- as.data.frame(missing_eval)
  } else {
    data[names(missing_eval)] <- missing_eval
  }

  data
}


peptides <- function(id,data,mapping,track='data') {
  default_aes = aes(colour = "black", size = 1, alpha = NA)
  dataframe = setNames(do.call('data.frame',lapply( names(mapping), function(x) with(data,eval(mapping[[x]])) )),names(mapping))

  if ('peptide.start' %in% names(dataframe)) {
    dataframe$peptide_start = dataframe$peptide.start
  }
  if ('peptide.end' %in% names(dataframe)) {
    dataframe$peptide_end = dataframe$peptide.end
  }
  dataframe = use_default_aes(default_aes,dataframe)
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
