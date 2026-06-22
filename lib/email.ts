import * as nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAaCAYAAADyrhO6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkMyMkY0RTU1RjdDMTFFQTk1QjJCMDEyM0IzRkE4NkMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkMyMkY0RTY1RjdDMTFFQTk1QjJCMDEyM0IzRkE4NkMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCQzIyRjRFMzVGN0MxMUVBOTVCMkIwMTIzQjNGQTg2QyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCQzIyRjRFNDVGN0MxMUVBOTVCMkIwMTIzQjNGQTg2QyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvmIsQoAACQtSURBVHja7Fx3fFTVtt7TUibJpIeEJBB6BEIHkV4UEAVBUIpcURHQhwreJ1XKBQQVsFxFpSrlggioFEVA4QKCQNBAQgIkQGghJCF9kkymnvd9J3NwjJkJ3ve83D/egfPLlH3OXnvVb629zqhKSkqEwWAQX375paisrJTPRx55RGzfvl1cu3ZNGI1GoVKphMViERqNRgQHB4vY2FjRokUL0b59e5Gfny9u374trly5Itq1ayd/7+/vL9Rqtbh69argUVBQIPz8/ER5ebnYtWuXyMjIEM8884x48MEHRVFRkfDx8ZE/27Nnj/D19RVarVYoh9lslt8PHz5cNGjQQFRUVMj3OnHihEwf55IkSR5LGvV6vYiLixMhISHyGNKYlJQkfvrpJ1FcXCyPjYmJESNGjBC3bt0SnTp1kj/Py8sTubm5omHDhuLGjRvi4MGD8trsdrs8x5AhQ+R1BwQEyPQqc7oeOp1OnDt3Thw7dkzmRdOmTcWlS5fEzZs35fdRUVHyelwPLy8veT7yi3zev3+/OHPmjLwWzhMZGSnT6u3tLfOKNHCNlJtyFhYWisaNG4tNmzbJ9+I9SUtCQoLo3bu3fA9e73A4fkczZcdrOCYoKEikp6fLn5GHnIfrr36QVuqFwnvStHv3bnHy5En5c85Vr1490b9/f5mu48ePi++//16e4+WXX5bp41op87Nnz8p6xfc8+Ndqtcqv+/btK/Ph4sWLonnz5rJMEhMTZT5wxPj2HUXLkDDhMJYJofcRwvGrTFSgwXQycVH++39/VRsRdg2TCMlo9FeFhBRGr1450b9n9xP2IugD/qmhc6ZTSW1uvvDiZ5bLl2Ilq90nZu2aSQEPPbheLf7/+EMHBUiBVj+pNPxLY+YYKludOnVEWFiYFsoaje8Da7pOufbfQTPnqX5SWemUQKcIDw/nqQa9MbgmkNe5O+/14QUa9hXmi4wGscI3qo4QxaXCYTIJyXnaS0uFT8d2X+ga1i8337wW7ygpjXeYLTGWy+mt8t95/23JZvPShoYIbXAQGeSVv3Tp3ysupLaxWStDDUMGnw4aMWy3Lrau0P6/yv8xRaNHLQXza/oO0S0EHj0GyhgGj9lo586d9crKygwRERFGRJOduO6UawSh92WUoMekx/+zDkYORl6bzfYbejG/ITs7OzYzM7MOPHMcIlEDnMGIokZEux2g66TrNdWuvefy0IE2b6AfW9MmQgIf/RDxbIgIMGEyV2hCQ1Ii5s75642nRm9wmMqFWh8g1DY/UfLtjh4Fq9ZMCZswfokNKKFo46bZxd/u6kGz967f8Fbk0iVj1X5+hYxI98RAyFwqhOJtFQ9Hb8bTFWJxLN+7elnF+90r2qnkNBRXT0p6oIj+gFcjYBhPASbVJzxo27bt+cWLFg0HhLvmg7BvxmfOGwkd1kqYR6jYuXNnGd7+Xx80QM5BeMuIpii8k97AQ4cOPb5169bRp06diufnzZo1u/rB3//+WElxSaYmRIPxVsUsSLRQzIJGzXvUBMH+jR5LgGnCBl263ShO1Pf1Ez6EUk7jJcwyDBq0MWDwY08V7drR31vnI1QwIrXFJAreXjbD8PCAz0y/nI7KW/TmLK5OrfUW4VOnzdYEB2dWMUl1bwyECk/cTIWgd6PQoHT1kQt0gFKVw0jucN1kMulgPCqMSSRkVvISKt+9CvWkX8HRrgYCGnNCQkOzunTp8g/kSW2Rl3Xo0bPn4W79+p27lZcrJKtN6Fywtg1rUDA4zz/jIF2IYjK90dHRd4yQn0PJC5BnFA4YMGA78rvmyBW6d+na9Wh006YpRaUlwsScpcoZy8bBF6GBgfK1iDz/KWFdaO0OYcYaTXo/4Y+czF5ly0IFOdGkg0aMmGlKSuphzbruqw0MFxq9QViyrgfnzJj9qcNU5m83FmqYnYWOfXqjb7u2nzqMpUIyBFTJ+l6sKRBM/u677+RkrkmTJnLSnZaW9vCGDRs+gfJZ8LlFcdgwBh8YkQ6e+AkkftsJFSgcJtV/JiypDWrRQGncasINp8KVl5V5a9Xq8E59+mwx2e2znx47ttFjjz1WJt3IEmHlFUIVZBDqIBnzCg2Ed+3KFVEJYw8CP/4syML7KrlG9WTYbrOpEVlC23Xt+l3Dli3njH/++bhGTZtWmmDMQeCzJjBIqPx8ZU8q30elFmGhoaKouPg/CvqScxquS6cVNuYft+FH6XCchq3v1Ol08Jinl+e+9cZUGWr5+AqNv0GUbN/2qEqtk4fpWyZcj5g9ew5gGZJ+o7BBv+6ZgSgVH1a5ENLlyhADA6tGzL+c528OeEEtwzkVszq8uRcGQuMohTAcKiFjXiqhCWLJNZaq7rfZ7M88+JAIaNL4cjAMwnT4R2FOPiv0vXoIn9athAprVzFqqFT/NqioGKCNkAjz07AtGrXWitdQBlPzOpEiOj7+anRsrLBCLuWJSSKgTy+hMQSy1FYVRvC/wOVe/1lWItFLCalhnNCAXrVK3IGD5HXoixPeMh0/3t94+EArGojspPwDhL2sVHg3aFwYNmnSBJWP1zWEVXn8HbRQk7dhVYMK7KqEfE1owc/p+Ylted4NNFByDuW+vA8/YyRhqZClX8ARM0vELOHVpJC4tpK08XqenFspkyoC4/ekzZUmhU7XeZXKDcdXFzav53dKqZRzu9LOgwbqDSwbU1IqY2DBXIoRRaMpvmi2WQNOHB56/8oVGcJotJfu2fdg2b79fX07ddqKUHmaoVzFBNJlXiXP4hzV6edrhX53vOUYhWbF4FzpVtYt3w8wT8q8IsMPb7utuKlKXd7yl+TB8dMeuiJCQ4orEn/uXvj5F0P9+/bdZPXy+sUOR6CiUUnO/EPz2/yQ87jyWNEZ0sS18DN3BkW6FB1yjWzK+hX5KDrpKkfXCtyd9QGqM++QGtQXaqtFaJBkS7yvhEiv9ysMnfzS3MoL5zc4CooMzEUkrE0SduHbtkOyb8eO+5iwq6TfOgCt62JDET4LCgq08Oz3Z2ZmPoCcIBwEa/gdPteD8HK8J27Nz8nJuYbP0sCEbCp5TcmaIjyWEIF9/bKysnrCABJKS0sDS0pKDDCK7Nzc3G+QpKbgfmWeIBPuJXOQEMtoNDbG+Pb4zIr5bcp3gGM60GKHof1Yt27dfBogEtSGN2/ebIe1NMZ1fhwLugsA046B4YmknbiczGdpFlEs+saNGx2QIzUFnQasS43ThHskh4eH78MYC/dNHFibL67TATo5qBik8fKVAQ/8Y9NzpqzrDYzHT5zR9+61p3THzkGFqz95xfd4+6fCpk19CRh3l4O8chYnyDdCTPIJ87YDdOwAGppA+GCHzgGelV2+fDkxJibmMNZjdI04vJ68BZ3eGNcdy2qD62MNBoMd67GCv3mQ5U+4TyKulQXkA1rN3NuCgugyr3Rvv2XbXyqTk1sZe/W8GDBk0ObSXbv63V75yasVx46NiZgxY3LAIwM/l+BVZUV12Ufhe/KONJBnkEc38KwZq3Z0dOBvKXSIdP8T9JiVqK9xJtF8jbFNIZ8EKLgd7yXnmiSgBC8ncvoB6yvhPs3169fvgwxagvcNjdzPwPVYbz6uP1G/fv2T3LOhTBDaBflrxmtvFhKcN3JAb7zqx+0MGjFyQ8GHy18SpIfFHpVOVBw53M4ycvgA3zat99qRGzMSORMvoVU8MWvgp0+fHr5nz55XsNgmrVq1+hnWmYYk+RaIUWORrffu3TsRzFCTOAjV1Lhx4wv9+vU7NHDgwDW4/lx1I6HCk/Bz5871+uCDD6bh+gFIZFW8vmvXrklY+LUlS5Y8HhcX926dOnXKAFtYMtHVZGikkx6Dm3ApKSmPf/LJJ287FdvqYiBa0GFau3ZtJ8yrRZ6zePPmzUMgrGBln4L3Ijz67LPPiidMmLAaec1sXGfBOuvs3r176vbt20dmZGREu3oyrgv5kTRo0KCvFy9e/BqEdqUUDJfXa7MLSca7Ustb7767znrubB2ytvDTdS9qYaSVaWndCMIqzvwSW7z2s5kBA/r/AAhQYSZchABplFhXfdx35tatW4eC9xE9evQ4GxkZ+Q84Dik+Pr7l7Nmzx8AIbK+88sqSJ554Yj1ok0tL3OC9cOFCn1WrVr3y/fffD6SDeP7553dBwf4JBxQMxeszfvz4qRERESnz58//GzT3p4qbN4VvZqbQ1q8Xl/fRJ6srTxxtxpsVrN/wtKZu5PWyg4cHaqBWFakp4QUffTxL363bEZW37qawgl4tPLrQyPwjLMZf3y+//PLldevWjUlNTU2gfJ566qmVoDXdarW2WLly5SMbN258beTIkQsglyOsfCkb05QH5PME1vYGXoOFGrtiIJCrDrpnbdmyZU/wuuDjjz9e8M033wy4fft2oGu0IR2ffvppMda8ZvLkybNxjVk2Piq3sxQtb45yPA1CT2ilrjrp0ghxAbOs+bcCC97/8O2o5e+f8GrUqFhSKo08sDDuIKtB6AfURVjjjWeeeWYIveTbb78t7yBzR3Pfvn1i6dKlbzoN8jcnFnLlq6++6spyInej6eVZaeIO+vLly5+D9zK5jg8JCSmE0STw+5kzZw4ePXr0VzC2G1i8qab78wQMG8pqF5Sfu7EzMbbGcTDc0meffXZ9p06dMmDkKa+//vrc7t27H3Z3Xwh0/rx58/r37t37GvKhy6+99triRx555Bt343v16vUj1hmQD09TnJ4uTGfThCXrpsj/eOULKWqtlKLzlVJ9AqRUQ6j5XFyTW/hrSw0IkVKEl5TerEV+4abPO5s+XScy930vki9fEtu2bbsPtKa5zgFlXvLjjz8KKL4sZMihY5cuXQ7DQJPhSaNZleK5evVq8rbM9drExMSBiCbil19+YfRUjxkzZjT4cGXu3LkrfvrlZ3EQcLbs8y9E3rJ3n0wNDAVdOinVL0hKDQ63nG/QJFt+bQiVzqp9pHMRdS2lO7/pa9y7Xxh37BY5ly+LHKybRZIDBw7E9u/f/4Dr3KDFBoPp+eSTT8qw+eDBg83HjRu3EjolwbgnfvTRR3Ru8pp4Lly4cLY7PsPYzJ07dz4G55kDZ3oSMpoDHhxzN37q1KnvOKO9jAhYTreWFAsrdMyGiMn5wPunU0PCy1PU3lKKyqtq3UHhUqqvQTqNe+S8sXix3VQprLdyhOX6DWG5kSXUVFKWXAF9wh9//PG9ixYt6oYQuYO5gIJruc3Pdgl4u9N8X/2AkcW98cYba2AYdVxzA3jksa+++upaeA0f1/EIzWW4VzkjTFRU1C54uaejo6MT4Rl87jJJdrjLfcrLy/0gmNGNGjVaDs/VAXQteOutt+bCmzpqGg9BTkV0+7pjx46fYWzH6dOnz4IRvhgbG5tV0/hDhw51279///BQwAgRHS000XWFDqfDaIx2OICB1VomPgKwxAvJbiQ8F7ewkZhrhcNUGWQ5mdiYxQhb3SjhrVJFrFixYh2UurnrHHAqz0DZOoMvciEDfDo1bdq0nsOHDx+G1wXOqNx5ypQpy8FbP9droYjz4ZwiiMuhjA7wdzM+69QyoeXiQMizdfMWwm/kk0Ltq4+ylxTIBQO54lNp1lmvXI36Nfxrhb3CpDPfzIqT47PdJsOVQEQOyDlmxowZ38Bp9nGdm04RUSJwwIABcoSBsp4D3RMbNGgwEYazAvDvOco8z1khcjq5Gg/CLBh6s6FDh86BwXWdM2fOQjjxBUQuNY1HJHkWeticNDBK3QaPLRUmGfpab2YL48GDTW8vfHOprfC2XoUkXR0aaiQck7gvxLxPqxMFy96bXH74aHfmlJqQYKHGGtSsjUNhHbDS5x7DAaO4RmuDZ5M9BcMhMSWjAqKKn7uqS1JSUjwE0oEbUgxrZ86caY7o8J7SV+N6IBJoYJR+ZOLDDz9MhS8bNmzYCtAhedoNJl1UDhih2d04RCc7lPwvHTp0+ABzW3gN1lQhfi1qVIdvvgkJCYsgiL8hBytkPoD7V+Jvubs50tLSEqxgrBHOxQ5hSxCILSenSrk06qpwTiaDd3fwLJTQXlys8Var6+QF+IuDF9PF/t3fPAxj7lRDf1T4qFGj1gM+JbAnChFa3uwDzy4hclSyV2rNmjUTwWvf6teeOHGiA+DGGsBXP6WXDAp522SqvO6FBDsQ2u4oLRO2/IJwqSoTrqKPia8LvXIlB57Yfvt2jMrbV6gABcvwPg8IARFt8alTp1rVVEwBVJWoM4Ts7MtCxBOIYKsg35mAYmsBG1tTl5wFFJOH/RsJEG3CiBEjVhNess8LkcEKuVhqGs+8Njk5OQGyEYmInuW5ecKb5iEXFVTa3HkLPyy/kBIhl3S7dDpe/6vtQ72aNL7kKCuW8xa13iDMxbf1+UuXLFD5+nipoQf4K9RsAIQgeJpgHxYyFYriA+YT7wVCaSMhFH82vcGILoMJFjcVCQmCC6FR0UsAT4+FUIPdlUklZ6mAEQfWL5DQheMeKk+VMJ5sQoQAyt0ZKozBDgO8jsRWQOnluaBYepWbujAVCJHzIr9u06aNHDURVf0hDG9P3q3CZBIVcAb20hL5dBQVhitr+03p0fmXCaG9FCHf3y8sYcJ4EVBSKo6dPNnAgxE2HTt27LpLly7dR94D2skJOTcW4VlV+Dze3bXA64Pg4FYj99CxWVOuQEIm0VpEfzsSboedES9MUnajq9PrNBxJsgrbrVvRAlAwB9dY4NBO//xzT+RjozxtTPKkThGZ0LiBIgSi+FuIZsnI/V7lOpwow+xhM9bm7e2dX7duXQFoJXcbwAj87IzINRxwhkRDgbl5uaKs1Cj03PfhrnmgQZQf+XGK8eihflypVm+QwqdMecO/e5cDwc+PWyHX5hhFZB75itID+3uVbt8xzqkcQuvcAZYrWFhUF2DXwYBTbcBUAwjywRkMq72GJHoTlFOC8pvhJbxqUHomWjL+O378uB4W/2BtewlOSKTsbdzVxgYVGtFE7eF7LeBhCCEGqyy/U9pqh3NXPorjGZ2cod+hJI01Hfxeab+w5eQCekhetuLi8N8pXPW2COEAJi6K0lmsIjosXDRq0uQG560pyvIA9GoHeLH166+/HgRFuXr//ffL/ELUlwAhLyH6dHZH4/r160cRVgKWjYdMTMFQyopLGYgMOqEC/+wFBVURT+WOlXBigFX2oqJIv9491KqSUkc5IuXhw4cHsRhSm5yoU3Rmxc5NxZycHIG1rAJ8fRnyi+RHnmROGUP3QpRijxJVatMpM3jZJCpKxCCCWcGryp+T2ubMmzNLLe9WSSL0xYkf+T/Yd4+8YT1q5OrSHTuHlB7c300XFMFSsLCXmETegoVzfVo2/9andevrMncAofyPHj36AcLgPiSG07/99tv+8EIPwFiaAk9uQ6L+z4yMjCEIrbNqCuuKgWABDgoQ3jsG0aPuH+k0vduNP2ckUXnarFLudTd9Qs79HSuNiXBA8WwQitUTGfIOuraqomMvNgbYi0sNKo8GQlZrhDU7O8a061u/1nENxAsvvPAN4EeyJ/pOnz7dEjD0B0SN5vS8bMen4iE6rmfVxtO1UMantmzZsh7yDXBAYbX16hFaCXNWVoANBqKSyVK7sw8Zk9oLCuvaNdrAcBh0ZESEd3p6+n132+JC/rNEy/yVuRRy2WOAXmZArVZs+ESeJXmQs1qB1nezMezUI0moNUjQwZZKk7Dn5oXnTJ+51nIrO5gG4t/zwaSwSf8134G57Ygyah+f0oh5c2ZqAoPKHMYiOYJqfQzClJkeWbBy9UKVFtGQ8AlGsRIh+WUsxN91UiS5m4DnpwHTzu/bt++TMJa1WtdOwhqUlwuHh9HDK96TPhAm8FBwtqvcldFxORhr5GvmH07v51Ub/dyACkL08AIkk+z2ALuxzM/jbFXWAw9VHGG8cjnY4KUTsZGRuYAfb8A4LZ4uPX/+fCPkJNtyc3ObEd8jgot+/fr9AANbWdv6EEme2L1798dhISHePo0bC0c58o+b2XpHSUmw0pDnnmTQW1wSYTmbFu4DRQ2OiPDiftbdOjLyn8/AECbxBEq5GRQUZAfCiFy+fLkcVSinmg7KkLkjo7rrZrCng9EjFONbsilTrdIXrlv3nunn4211Kp3QRsWURiyY99/a2Jh8bhDay8qEBEPSd+1yNHzylFUSoCchldpPL7R+BlGyZevThRs3jdUC/4/BOdoNkWV79+6Vq1gQSjnC+oXaWiOocJ6qE3/2gbkBlQMqlQe8ajsYOZD/2JHgiXnz5imRR+MJxjknEpqr14SdbeQqVahUWckMtzaASM8Vro2qG1z47d6sACS+D/TquX3atGnN586dO9/TlSkpKc1nzJixbPPmzU9CLiaubebMmQsQ2Zsi4g/wdC1w/5hmzZol39+p0zLdw/1F4eatBntRYcAd6OdW+TTCnl8Qai8ujtB6e2fYHXb4BZX9X3Bad/JORn82nxJpwAAkd06MUR3GYareCeAR1vHhNnbwwolUmioD1UHB14Kf+ssSlV1S6/v0TPJt2/qQnd0PMBCNv59cvVJr1CL0hQlvOm7nl9pLjHpNSGCZClQhwgZLRqNDvWPHjn7uJoR1q1gx4VNu9FpQOkNNT6W5egxWvOApirGw8j/Kx7s0AJ52d4x10iG5Qi3lvTsogIinYkKpPKtBqMizlmYyUX42DUndYVF+7HhDR0lpiErjVRv1VLhgtVoVoYuKECrAnhJg9J69ei188cUXP61t7Tt37nwUkOlJKgzlAW9csHTp0lfatWuXVtu1H3300eSsnJx6anh0Xb16kebrV8NUtbCclSxbSbGPNfd2lASFUqk1lQZDQMkf6f8ixOKTg3BCrM5FAbFoACtzJk2axKiiddfiT0OCrqn+SN+XlrvzMJIS6CCiZU7wiCdfhzOarvbXT9UEBX0umS2ycSiOQem5wt98TXDwfI0hYDrOhWpDwAKNwfCqvkf3jWrAqjoeLN+udIHejRJzURwPb3UzLi7u0t0sigZH5aTHv5vGPSa0gECeYJ4G99JynGLMTkaraut2daHJ7fg7jJAcQotwro1EchcY5LAZi4XDbqkqk7qnXpiuX/aWzOb4wJEjMLldZF/O5Hqk9u3bT37ooYe+rW39iOiDYchqro+VHTiji2vWrBkGnl/3dB0UNebrnTsfvn7xkvBGhHdUVGgcQvLk9gVhh624QG0+d75Z6ZbtwpSfb2vVvkPy3SosK5Qs5bNjm8+inD17thuT9okTJyYRciFP9f+/RA+Ea9xjuXTxoixaB1tkeMIRybvj1Y3N+V7+Xhln/fW1XP79tSLjvmrk8lCTzROul5v4QCSgmA3C3nE33aWsl7/11lvigQceKEHYlTxFDioyy9BFRUUB7iIZW+ORB+mZC3G32dkJ7F9blUx+PsP5MBE3G+GhfT3SD29kG/Ko8GqTIIKGDtob9uLEtWovb/lxzxrHgzeakDBLQK/eKV4xMbAKizh1IV2kpqeLVgkJ7FYo27hx48iBAwf+4Gle4PZoGIcXn8/mbjlbb2Ak6TCSofHx8Vkec5nU1AanUs8Knz69E+vMnveuNjDE4XDuSdRQhhIavwCbf89e57y7dznvA7v3t1jFwEGDdoSEhBTVJltGuR9++EGuDN533318cEz9xRdfjMffn2A4t5Xo/UdhWm3zKsWWAhiij7Mq+b851B06dDjvYUKJP3BApWcC26BBA6M7xVRVtW7b6dkYEXr16vU5vOJ5N0rsCAwMlG9EhUfIpTfsAsVU3U3EoYevLZKRWUoVizmFu1CtGAY3tRQDYYRSqihuK3ZMCgMNwlJpprMt13foODF0wsQZKh9v2QPdqWbRE/O93SbCXnr5vZhl7/TxCQ/dewGe/GJ2tlcMPKlizOxHW7Vq1dOdO3dOdDd3REREPjC2hU2lCj9IN5QuCTnU+Pr167t9WKNpo0bXGsfG0rVXhr/26n9HvD5rsibQYJIIc1zopee0V5SK0JdfXh2zclUPXXTUV5rm8cIGpW+XkJA8bty4zzyUd5W+OLmNSTnYVgK00mzKlCnvKbDKE/RVvq/2LHyteIuGyS6QvIICuULnZfvfPfGoHj169DrAC8lNiJQGDx4s/xoFFDgBCeJEGIC7HWkVvAUTKxkfg1H5Q4YMedXl4ac7BwTsgCfMYV8Oa9yLcCBJneFp74G6oLSq4xqP41j/dxYLlOjjNmehcrHcSCNV2mQ4nsbuaROLZV61RisqO7QXjuIS4dW4od0w9LGDKl89+y2qW7VQ6bwAxQIzvMvLC1KTzkgHTp0SJUVFIw8dOvRlSUlJQ/4iCZJubgbeQr4wDl43o6a5wdM1oNlx9erVN48ePfoOorXMbz6AlpCQsHfWrFmTkJv8zkgaNmyYO3z48O9adeggKkzlwn79hvBtlfC9tk5kAWFFdejBf7p60ZmSxVzgMJbJiJOyJc5//fXXF8EBHqnJg0M+DkQy2ZPTqbKKtXz58qmLFy+eP3ny5Akw4AyXdnaHp2qkMxeUnYBzv0rnDvo6HbSDf1kGP4dImZGVJcyhocIb8Er6F58fYgT5CQt4AYr8O4UA0/vDo43bs2fPuydOnFiVlZUV5Y5A7mRevHgxnj81w596IWMAs/Zt27ZtWL169Qpcx0KgYStXruw3atSoTvBGe9auXfvco48+uttThQTM8aEAqAw4vd1troGRXhUVFTzvbMDxM3cRhN4GkVHH3V4WGJxrYTnTbXwGzo2i1y9E9KvQaoQuLFw4qvp+dIBZJknpIL3DZY38kzS27OyY0iNHhTdoaQxcfl98fOaBAwd6YO3J8BfPQrHrsDcOSXcqjGV29XnhhRd069aNP6ZAJSiB3P46e/bsIzCUAbGxsb5sS4GRbx4zZsxW1+vweR6iy7iwiIirFj5Pn54hTKlpwOVWaLzW8bvM0gl9rJevRlUcPiIchSXClnWzCpcL+YnQwg0bNowcNmzYd9UgtqN169bZrHo6fxKoO/KN7dOnT1/y5ptvjsW6NjMHUUq74LHb3jtE9AC23FA+vIYRlo8r4K+fO2TB7gfmsjxtiOzHc7LF4RbNRD7yIF/+2sm/YCT8SRr+RtUq5AL5H3744SuHDx/uzq5IfpmcnNx60qRJax5//PFjgwYN+issNBT4bgOrPvSiLg8qSVBIPQTVOzs7eyXe3+bOPCMPOx/gIfvBU07fvn37AD4Hgnvot2zZ8jk8jBkCvbhv377uuK4+W7bB2FLWwJWqmLPlQwOmmp1eguVBM5TJATqNznZ3heG+8MBWtkorz1g4kzcLhFqOcQ72cSnjudeBM4BJvbPF5s56oIAFNCx4zQrXzSs+I8II5WzMEzYag3w/QCmHpJVsVj9Jqkr0hNJ27bALqRIG5OUVaNH7ihgYR/wDXfjI69Fly5a1x/rngndvwwH915UrV1KQwObAcHo5aa/s3bv3KUTy1XAoG9mIR5k98cQTb8Abn1qxYsUs3GNtixYtLpw6dSoZsMYCXj7Ma6Ojo2/16dPnR6CEd8G7k4Uw6lA+EHTtulAFBwlHZaUWEcIg00vlv9Ma43yGwlxpoDu05eUKe0aG8O/VXXFW/C2sW4j6g3v06PECHxGAA72f/CSUQvS7AGfZDLQ2hXHeAvJoC96dYUVU75IXOOVilCOyM2I7fxdL5/pbZ5Q5ozvkbQbELAAUp95aFR1xluU1+MymcnlKE4IQFm8vkdyjqwj09ROR7C3jbwn8gcqYik1wCiwCYUGnT5/unpaW1pgNhQEBAeVt2rS5iDzkGNsVoHwB6enp7UAQ20ocrgbC/iQSBuacwd8iCpEemT8oxz0GeD41W1mSkpISwDg9xvsC1tzs2LHjdhinEfNHJiYmtgXTKgihlMUzrLKPCsldMpWW7fTwJDG4b0vMU0mmuCo8e7EgvLN4XQRmyp4MXjkYcK4NvQyM745BcY0Y5wtIkIp7ZylPq4EW/dmzZ1sxuWfjoiuMhCPwBay5iqiTYeYTbIhUWsAVPpbqMJla5Mycs8yWlxeoDvCvENxLIW5mG3aFSR/8l9H/0NWt+6GAd9P27imMUNIj+/fLPWOZmZn38UcTwN8GWJ83DRnruIEIn47c5Bd40mI6HBom++f443KsBLEvC3x44MiRI53xOhrr56PJRYjiV8DbFHj0ZIx1pJ07Jx7q21eEAA6yBZzNicJqa5T3zntLLRcvRasDDWWCuR3pBetthQVBwaNHbfeKq7fYYaqUDcgL+ahh8KPCyl92gb7wx/j4g3iQUSj42wlnU9BQl3KAHmSDr8dgAMdZyQJ98hOkcLR3KobISepBjo1Av821NM8ckBAL+pEK+RVSN5m3gP9h7EHD/TV8yMrFQNSUTbNmzTKgy7dcOyhoDGZuBtNg+Ki0piqa63Taql/VAS3W7GxR8P6Hgj8kpwkOlL2DvbBIhEx+SfyPAAMAehctzn/ua/gAAAAASUVORK5CYII=";
// ═══════════════════════════════════════════════════════════════════════
// NODEMAILER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions): Promise<void> {
  const transporter = getTransporter();
  const attachments: any[] = [];
  
  if (html.includes("cid:logo")) {
    const logoPath = path.join(process.cwd(), "public", "admissionx-logo.png");
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: "admissionx-logo.png",
        path: logoPath,
        cid: "logo",
      });
    }
  }

  await transporter.sendMail({
    from: `"AdmissionX" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function escapeHtml(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com").replace(/\/$/, "");
}

function getPublicLogoUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && !siteUrl.includes("localhost")) {
    return `${siteUrl.replace(/\/$/, "")}/admissionx-logo.png`;
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl && !baseUrl.includes("localhost")) {
    return `${baseUrl.replace(/\/$/, "")}/admissionx-logo.png`;
  }
  return "https://admissionx.com/admissionx-logo.png";
}

function loadTemplate(filename: string): string {
  const templatePath = path.join(process.cwd(), "lib", "emails", filename);
  return fs.readFileSync(templatePath, "utf-8");
}

function renderTemplate(title: string, preheader: string, body: string): string {
  const baseUrl = getBaseUrl();
  const logoUrl = getPublicLogoUrl();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 0; background: #f3f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #102033; }
    .preheader { display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; }
    .wrap { max-width: 640px; margin: 32px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.10); border: 1px solid #e7eef3; }
    .hero { background: linear-gradient(135deg, #fff7f2 0%, #eefcf8 100%); padding: 34px 38px 26px; text-align: center; border-bottom: 1px solid #edf2f5; }
    .logo { width: 150px; height: auto; display: block; margin: 0 auto 18px; }
    .kicker { margin: 0; color: #0f766e; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
    .hero h1 { margin: 8px 0 0; color: #14213d; font-size: 25px; line-height: 1.25; font-weight: 800; }
    .body { padding: 34px 40px 38px; color: #334155; line-height: 1.65; }
    .body p { margin: 0 0 16px; font-size: 15px; }
    .panel { margin: 22px 0; padding: 18px 20px; border-radius: 14px; background: #f8fafc; border: 1px solid #e2e8f0; }
    .row { margin: 8px 0; font-size: 14px; }
    .label { color: #64748b; font-weight: 700; }
    .value { color: #0f172a; font-weight: 800; }
    .status { display: inline-block; padding: 7px 14px; border-radius: 999px; background: #ecfdf5; color: #047857; font-size: 12px; font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase; }
    .btn { display: inline-block; margin-top: 8px; padding: 13px 24px; border-radius: 12px; background: #0f766e; color: #ffffff !important; font-size: 14px; font-weight: 800; text-decoration: none; }
    .sign { margin-top: 24px; color: #475569; }
    .footer { padding: 22px 38px; text-align: center; background: #0f172a; color: #cbd5e1; }
    .footer p { margin: 0; font-size: 12px; line-height: 1.6; }
    .footer a { color: #5eead4; text-decoration: none; }
    @media (max-width: 680px) {
      .wrap { margin: 0; border-radius: 0; }
      .hero, .body, .footer { padding-left: 22px; padding-right: 22px; }
      .hero h1 { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="preheader">${escapeHtml(preheader)}</div>
  <div class="wrap">
    <div class="hero">
      <img class="logo" src="${logoUrl}" alt="AdmissionX" />
      <p class="kicker">World's First Online Admission Portal</p>
      <h1>${escapeHtml(title)}</h1>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>
        AdmissionX - World's First Online Admission Portal<br />
        <a href="${baseUrl}">${baseUrl.replace(/^https?:\/\//, "")}</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ═══════════════════════════════════════════════════════════════════════
// STUDENT EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════

export async function sendStudentRegistrationEmail(
  to: string,
  name: string,
  email: string,
  phone: string,
  activationLink?: string
): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Student Registration Email</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght=300;400;500;600&family=DM+Serif+Display&display=swap');
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .email-card-cell { padding-left: 20px !important; padding-right: 20px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    .benefits-sep { display: none !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; padding-top: 6px !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      
      <!-- MASTER CONTAINER TABLE (locks all elements in alignment) -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">
        
        <!-- BRAND STRIP / HEADER -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px; text-align: left;">

            <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 24px; display: inline-block;">
              <tr>
                <td valign="middle" style="line-height: 1;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block;"></div>
                </td>
                <td valign="middle" style="font-size: 12px; color: #D91A1A; font-weight: 500; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                  Account Created Successfully
                </td>
              </tr>
            </table>

            <div style="font-size: 22px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; margin-bottom: 10px; line-height: 1.3;">
              Dear <strong style="color: #D91A1A; font-weight: bold;">${escapeHtml(name)}</strong>,
            </div>
            <p style="font-size: 15px; color: #444444; line-height: 1.7; margin-bottom: 6px; font-family: 'DM Sans', sans-serif; margin-top: 0;">
              Welcome on board <strong style="color:#111">AdmissionX</strong> — the world's first online admission portal.
            </p>
            <p style="font-size: 14px; color: #666666; line-height: 1.7; margin-bottom: 28px; font-family: 'DM Sans', sans-serif;">
              Your account has been successfully created and your admission journey has officially begun.
            </p>

            <hr style="height: 1px; background-color: #F0EFEB; margin: 24px 0; border: none;">

            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">You can now</div>
            
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
              <tr>
                <!-- Item 1 -->
                <td valign="top" width="50%" style="padding-bottom: 12px; padding-right: 6px;" class="col-stack">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border: 1px solid #EEECEA; border-radius: 10px; border-collapse: collapse; height: 100%;">
                    <tr>
                      <td valign="top" style="padding: 12px 14px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td valign="top" width="28" style="padding-top: 2px;">
                              <div style="width: 28px; height: 28px; border-radius: 7px; background-color: #111111; text-align: center; line-height: 28px; font-size: 14px;">🎓</div>
                            </td>
                            <td valign="top" style="padding-left: 10px; font-size: 12.5px; color: #444444; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                              Explore courses &amp; universities
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
                <!-- Item 2 -->
                <td valign="top" width="50%" style="padding-bottom: 12px; padding-left: 6px;" class="col-stack">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border: 1px solid #EEECEA; border-radius: 10px; border-collapse: collapse; height: 100%;">
                    <tr>
                      <td valign="top" style="padding: 12px 14px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td valign="top" width="28" style="padding-top: 2px;">
                              <div style="width: 28px; height: 28px; border-radius: 7px; background-color: #111111; text-align: center; line-height: 28px; font-size: 14px;">👤</div>
                            </td>
                            <td valign="top" style="padding-left: 10px; font-size: 12.5px; color: #444444; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                              Complete your profile
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <!-- Item 3 -->
                <td valign="top" width="50%" style="padding-top: 6px; padding-right: 6px;" class="col-stack">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border: 1px solid #EEECEA; border-radius: 10px; border-collapse: collapse; height: 100%;">
                    <tr>
                      <td valign="top" style="padding: 12px 14px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td valign="top" width="28" style="padding-top: 2px;">
                              <div style="width: 28px; height: 28px; border-radius: 7px; background-color: #111111; text-align: center; line-height: 28px; font-size: 14px;">📄</div>
                            </td>
                            <td valign="top" style="padding-left: 10px; font-size: 12.5px; color: #444444; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                              Upload required documents
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
                <!-- Item 4 -->
                <td valign="top" width="50%" style="padding-top: 6px; padding-left: 6px;" class="col-stack">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border: 1px solid #EEECEA; border-radius: 10px; border-collapse: collapse; height: 100%;">
                    <tr>
                      <td valign="top" style="padding: 12px 14px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td valign="top" width="28" style="padding-top: 2px;">
                              <div style="width: 28px; height: 28px; border-radius: 7px; background-color: #111111; text-align: center; line-height: 28px; font-size: 14px;">⚡</div>
                            </td>
                            <td valign="top" style="padding-left: 10px; font-size: 12.5px; color: #444444; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                              Apply for admissions online
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${activationLink ? `
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin: 30px 0; text-align: center;">
                <tr>
                  <td align="center">
                    <p style="font-size: 14px; color: #444; margin-bottom: 15px; font-family: 'DM Sans', sans-serif;">Please activate your account to get started:</p>
                    <a href="${activationLink}" style="display: inline-block; background: #D91A1A; color: #fff !important; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; font-family: 'DM Sans', sans-serif;">Activate Your Account</a>
                    <p style="font-size: 12px; color: #888; margin-top: 10px; font-family: 'DM Sans', sans-serif;">This link will expire in 24 hours.</p>
                  </td>
                </tr>
              </table>
            ` : ''}

            <!-- LOGIN DETAILS BOX -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-radius: 12px; margin-bottom: 28px; border-collapse: collapse; width: 100%;">
              <tr>
                <td style="padding: 20px 22px;">
                  <div style="font-size: 12px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 14px; text-align: center; font-family: 'DM Sans', sans-serif;">Login Details</div>
                  
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                    <!-- Email Row -->
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.07); font-size: 12px; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif;" align="left">Email</td>
                      <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.07);" align="right">
                        <span style="font-size: 12.5px; color: #D91A1A; font-family: 'DM Sans', monospace; font-weight: 500; background: rgba(217,26,26,0.1); padding: 3px 10px; border-radius: 5px;">${escapeHtml(email)}</span>
                      </td>
                    </tr>
                    <!-- Phone Row -->
                    <tr>
                      <td style="padding: 8px 0; font-size: 12px; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif;" align="left">Mobile</td>
                      <td style="padding: 8px 0;" align="right">
                        <span style="font-size: 12.5px; color: #D91A1A; font-family: 'DM Sans', monospace; font-weight: 500; background: rgba(217,26,26,0.1); padding: 3px 10px; border-radius: 5px;">${escapeHtml(phone)}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="font-size: 14px; color: #555555; line-height: 1.7; margin-bottom: 24px; font-family: 'DM Sans', sans-serif;">We are excited to help you shape your future.</p>

            <hr style="height: 1px; background-color: #F0EFEB; margin: 24px 0; border: none;">

            <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif;">
              <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
              Team AdmissionX
              <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block;">World's First Online Admission Portal</span>
            </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">
              Why AdmissionX
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <!--[if mso]>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                  <td width="262" valign="top" style="padding-right: 8px;">
                  <![endif]-->
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif; font-weight: bold;">
                                For Students
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Apply to multiple universities in one place</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time application status tracking</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Secure digital document management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Expert counselling &amp; guidance support</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">100% paperless admission process</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  <td width="262" valign="top" style="padding-left: 8px;">
                  <![endif]-->
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif; font-weight: bold;">
                                For Colleges
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Centralized student application dashboard</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Automated document verification system</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Instant communication with applicants</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time seat &amp; enrollment management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Data-driven admission analytics</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
              Connect with us
            </div>
            
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <!-- Facebook -->
              <a href="https://facebook.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="facebook" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Facebook</span>
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="instagram" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Instagram</span>
              </a>
              <!-- Twitter/X -->
              <a href="https://twitter.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">X (Twitter)</span>
              </a>
            </div>
          </td>
        </tr>

        <!-- FOOTER STRIP -->
        <tr>
          <td style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-bottom: 1px solid #E8E8E4; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 16px 32px; text-align: center; font-family: 'DM Sans', sans-serif; font-size: 11px; color: #AAAAAA; line-height: 1.6;">
                  <div style="margin-bottom: 6px;">This is an automated email. Please do not reply directly to this message.</div>
                  <div>© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
      
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Welcome to AdmissionX - Registration Successful",
    html,
  });
}


export async function sendOTPEmail(
  to: string,
  name: string,
  otp: string,
  expiryMinutes: number
): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – OTP Verification Email</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .email-card-cell { padding-left: 20px !important; padding-right: 20px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      
      <!-- MASTER CONTAINER TABLE (locks all elements in alignment) -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">
        
        <!-- BRAND STRIP / HEADER -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px; text-align: left;">

            <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 24px; display: inline-block;">
              <tr>
                <td valign="middle" style="line-height: 1;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block;"></div>
                </td>
                <td valign="middle" style="font-size: 12px; color: #D91A1A; font-weight: 500; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                  OTP Verification
                </td>
              </tr>
            </table>

            <div style="font-size: 22px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; margin-bottom: 10px; line-height: 1.3;">
              Dear <strong style="color: #D91A1A; font-weight: bold;">${escapeHtml(name)}</strong>,
            </div>
            <p style="font-size: 14px; color: #666666; line-height: 1.7; margin-bottom: 32px; font-family: 'DM Sans', sans-serif; margin-top: 0;">
              Your AdmissionX verification OTP is ready. Use it below to verify your account securely.
            </p>

            <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

            <!-- OTP DISPLAY -->
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; text-align: center; font-family: 'DM Sans', sans-serif;">Your One-Time Password</div>
            
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-radius: 14px; text-align: center; margin-bottom: 20px; border-top: 3px solid #D91A1A; border-bottom: 3px solid #D91A1A; border-collapse: collapse; width: 100%;">
              <tr>
                <td style="padding: 32px 24px 28px;" align="center">
                  <div style="font-size: 11px; color: rgba(255,255,255,0.35); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 18px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
                    AdmissionX Verification Code
                  </div>
                  <div style="font-size: 52px; font-weight: 600; letter-spacing: 0.22em; color: #FFFFFF; font-family: 'DM Sans', monospace; line-height: 1; margin-bottom: 18px; text-shadow: 0 0 40px rgba(217,26,26,0.4);">
                    <span style="color: #D91A1A;">${escapeHtml(otp)}</span>
                  </div>
                  
                  <!-- OTP VALIDITY -->
                  <table align="center" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); border-radius: 100px; border-collapse: collapse; margin: 0 auto;">
                    <tr>
                      <td style="padding: 5px 0 5px 14px; line-height: 1;" valign="middle">
                        <img src="https://img.icons8.com/material-outlined/13/D91A1A/clock.png" alt="clock" width="13" height="13" style="width: 13px; height: 13px; display: inline-block; vertical-align: middle; border: 0;">
                      </td>
                      <td style="padding: 5px 14px 5px 7px; font-family: 'DM Sans', sans-serif; font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1;" valign="middle">
                        Valid for <strong style="color: #D91A1A; font-weight: bold;">${expiryMinutes} minutes</strong> only
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- SECURITY WARNING -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFBF0; border: 1px solid #FDEAB0; border-left: 3px solid #E5A800; border-radius: 0 10px 10px 0; border-collapse: collapse; margin-bottom: 28px; width: 100%;">
              <tr>
                <td style="padding: 14px 0 14px 16px; width: 30px;" valign="top" align="left">
                  <div style="width: 30px; height: 30px; background-color: #FFF3CC; border-radius: 8px; text-align: center; line-height: 30px;">
                    <img src="https://img.icons8.com/material-outlined/15/C88800/high-priority.png" alt="warning icon" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                  </div>
                </td>
                <td style="padding: 14px 16px 14px 12px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #7A5500; line-height: 1.6;" valign="top" align="left">
                  <strong style="color: #5C3E00; display: block; margin-bottom: 2px; font-weight: bold;">Security Notice</strong>
                  Please do not share this OTP with anyone for security reasons. AdmissionX will never ask for your OTP over call or email.
                </td>
              </tr>
            </table>

            <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

            <!-- STEPS -->
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">
              How to use your OTP
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
              <!-- Step 1 -->
              <tr>
                <td valign="top" width="36" style="padding: 10px 0; border-bottom: 1px solid #F5F5F2;" align="left">
                  <table cellpadding="0" cellspacing="0" border="0" width="22" height="22" style="background-color: #111111; border-radius: 11px; width: 22px; height: 22px; border-collapse: collapse;">
                    <tr>
                      <td align="center" valign="middle" style="font-size: 11px; font-weight: 600; color: #D91A1A; font-family: 'DM Sans', sans-serif; line-height: 1;">1</td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="padding: 12px 0 10px 0; border-bottom: 1px solid #F5F5F2; font-size: 13.5px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;" align="left">
                  Go to the AdmissionX verification page on your browser or app
                </td>
              </tr>
              <!-- Step 2 -->
              <tr>
                <td valign="top" width="36" style="padding: 10px 0; border-bottom: 1px solid #F5F5F2;" align="left">
                  <table cellpadding="0" cellspacing="0" border="0" width="22" height="22" style="background-color: #111111; border-radius: 11px; width: 22px; height: 22px; border-collapse: collapse;">
                    <tr>
                      <td align="center" valign="middle" style="font-size: 11px; font-weight: 600; color: #D91A1A; font-family: 'DM Sans', sans-serif; line-height: 1;">2</td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="padding: 12px 0 10px 0; border-bottom: 1px solid #F5F5F2; font-size: 13.5px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;" align="left">
                  Enter the OTP code shown above in the verification field
                </td>
              </tr>
              <!-- Step 3 -->
              <tr>
                <td valign="top" width="36" style="padding: 10px 0; border-bottom: 1px solid #F5F5F2;" align="left">
                  <table cellpadding="0" cellspacing="0" border="0" width="22" height="22" style="background-color: #111111; border-radius: 11px; width: 22px; height: 22px; border-collapse: collapse;">
                    <tr>
                      <td align="center" valign="middle" style="font-size: 11px; font-weight: 600; color: #D91A1A; font-family: 'DM Sans', sans-serif; line-height: 1;">3</td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="padding: 12px 0 10px 0; border-bottom: 1px solid #F5F5F2; font-size: 13.5px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;" align="left">
                  Click <strong style="color: #111111; font-weight: bold;">Verify</strong> to complete your account verification
                </td>
              </tr>
              <!-- Step 4 -->
              <tr>
                <td valign="top" width="36" style="padding: 10px 0;" align="left">
                  <table cellpadding="0" cellspacing="0" border="0" width="22" height="22" style="background-color: #111111; border-radius: 11px; width: 22px; height: 22px; border-collapse: collapse;">
                    <tr>
                      <td align="center" valign="middle" style="font-size: 11px; font-weight: 600; color: #D91A1A; font-family: 'DM Sans', sans-serif; line-height: 1;">4</td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="padding: 12px 0 10px 0; font-size: 13.5px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;" align="left">
                  If the OTP expires, request a new one from the login screen
                </td>
              </tr>
            </table>

            <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif;">
              <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
              Team AdmissionX
              <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block;">World's First Online Admission Portal</span>
            </div>
          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">
              Why AdmissionX
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <!--[if mso]>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                  <td width="262" valign="top" style="padding-right: 8px;">
                  <![endif]-->
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif; font-weight: bold;">
                                For Students
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Apply to multiple universities in one place</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time application status tracking</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Secure digital document management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Expert counselling &amp; guidance support</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">100% paperless admission process</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  <td width="262" valign="top" style="padding-left: 8px;">
                  <![endif]-->
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif; font-weight: bold;">
                                For Colleges
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Centralized student application dashboard</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Automated document verification system</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Instant communication with applicants</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time seat &amp; enrollment management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="16" style="font-size: 14px; line-height: 1.5; color: #D91A1A; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Data-driven admission analytics</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
              Connect with us
            </div>
            
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <!-- Facebook -->
              <a href="https://facebook.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="facebook" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Facebook</span>
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="instagram" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Instagram</span>
              </a>
              <!-- Twitter/X -->
              <a href="https://twitter.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">X (Twitter)</span>
              </a>
            </div>
          </td>
        </tr>

        <!-- FOOTER STRIP -->
        <tr>
          <td style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-bottom: 1px solid #E8E8E4; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 16px 32px; text-align: center; font-family: 'DM Sans', sans-serif; font-size: 11px; color: #AAAAAA; line-height: 1.6;">
                  <div style="margin-bottom: 6px;">This is an automated email. Please do not reply directly to this message.</div>
                  <div>© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
      
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Your AdmissionX OTP Verification Code",
    html,
  });
}


export async function sendProfileCompletionReminder(
  to: string,
  name: string,
  progressPercent: number = 25,
  steps?: {
    personalDetails?: "completed" | "urgent" | "pending";
    academicInfo?: "completed" | "urgent" | "pending";
    documentUpload?: "completed" | "urgent" | "pending";
    coursePreferences?: "completed" | "urgent" | "pending";
  }
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;

  const resolvedSteps = {
    personalDetails: steps?.personalDetails || "urgent",
    academicInfo: steps?.academicInfo || "urgent",
    documentUpload: steps?.documentUpload || "pending",
    coursePreferences: steps?.coursePreferences || "pending",
  };

  // Helper function to resolve styles and classes for each step card
  const getStepCard = (status: "completed" | "urgent" | "pending", title: string, desc: string, iconName: string) => {
    let cardStyle = "";
    let badgeStyle = "";
    let badgeText = "";
    let iconUrl = "";

    if (status === "completed") {
      cardStyle = "background-color: #F4FBF7; border: 1px solid #D1EBE1; border-left: 3px solid #047857; border-radius: 0 12px 12px 0; padding: 16px 16px 14px; text-align: left; font-family: 'DM Sans', sans-serif;";
      badgeStyle = "font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #047857; background-color: #ECFDF5; padding: 3px 8px; border-radius: 20px; font-family: 'DM Sans', sans-serif;";
      badgeText = "Completed";
      iconUrl = `https://img.icons8.com/material-outlined/15/047857/${iconName}.png`;
    } else if (status === "urgent") {
      cardStyle = "background-color: #FFF8F8; border: 1px solid #FFDADA; border-left: 3px solid #D91A1A; border-radius: 0 12px 12px 0; padding: 16px 16px 14px; text-align: left; font-family: 'DM Sans', sans-serif;";
      badgeStyle = "font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #D91A1A; background-color: #FFF0F0; border: 1px solid #FFDADA; padding: 3px 8px; border-radius: 20px; font-family: 'DM Sans', sans-serif;";
      badgeText = "Required";
      iconUrl = `https://img.icons8.com/material-outlined/15/D91A1A/${iconName}.png`;
    } else {
      cardStyle = "background-color: #FAFAF8; border: 1px solid #EEECEA; border-radius: 12px; padding: 16px 16px 14px; text-align: left; font-family: 'DM Sans', sans-serif;";
      badgeStyle = "font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #AAAAAA; background-color: #F0EFEB; padding: 3px 8px; border-radius: 20px; font-family: 'DM Sans', sans-serif;";
      badgeText = "Pending";
      iconUrl = `https://img.icons8.com/material-outlined/15/AAAAAA/${iconName}.png`;
    }

    return `
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: separate; box-sizing: border-box;">
        <tr>
          <td valign="top" style="${cardStyle}">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; width: 100%;">
              <tr>
                <td valign="top" style="padding-bottom: 10px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; width: 100%;">
                    <tr>
                      <td align="left" valign="middle" width="32">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 32px;">
                          <img src="${iconUrl}" alt="${title}" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                        </div>
                      </td>
                      <td align="right" valign="middle">
                        <span style="${badgeStyle}">${badgeText}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="font-size: 13px; font-weight: 600; color: #111111; padding-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                  ${title}
                </td>
              </tr>
              <tr>
                <td style="font-size: 12px; color: #888888; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                  ${desc}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  };

  const personalDetailsCard = getStepCard(resolvedSteps.personalDetails, "Personal Details", "Name, DOB, address &amp; contact info", "user");
  const academicInfoCard = getStepCard(resolvedSteps.academicInfo, "Academic Information", "Marks, grades &amp; previous qualifications", "graduation-cap");
  const documentUploadCard = getStepCard(resolvedSteps.documentUpload, "Document Upload", "Certificates, ID proof &amp; photographs", "upload");
  const coursePreferencesCard = getStepCard(resolvedSteps.coursePreferences, "Course Preferences", "Choose your preferred courses &amp; colleges", "todo-list");

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Profile Completion Reminder</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  @media only screen and (max-width: 600px) {
    .email-outer {
      width: 100% !important;
    }
    .brand-logo-cell {
      padding-left: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .brand-tagline-cell {
      padding-right: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .email-card-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 28px !important;
      padding-bottom: 20px !important;
    }
    .benefits-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 24px !important;
      padding-bottom: 8px !important;
    }
    .social-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell .col-stack {
      text-align: center !important;
      margin-bottom: 8px !important;
    }
    .footer-text-right {
      text-align: center !important;
    }
    .col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-bottom: 12px !important;
    }
    .benefits-col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .benefits-sep {
      display: none !important;
    }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      
      <!-- MASTER CONTAINER TABLE (locks all elements in alignment) -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">
        
        <!-- BRAND STRIP / HEADER -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">
              
              <!-- REMINDER BADGE -->
              <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFBF0; border: 1px solid #FDEAB0; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 24px; display: inline-block;">
                <tr>
                  <td valign="middle" style="line-height: 1;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #E5A800; display: inline-block; vertical-align: middle;"></div>
                  </td>
                  <td valign="middle" style="font-size: 12px; color: #A07000; font-weight: 500; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                    Action Required — Profile Incomplete
                  </td>
                </tr>
              </table>

              <!-- GREETING -->
              <div style="font-size: 22px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; margin-bottom: 10px; line-height: 1.3;">
                Dear <strong style="color: #D91A1A; font-weight: bold;">${escapeHtml(name)}</strong>,
              </div>
              
              <!-- HEADLINE & SUBLINE -->
              <p style="font-size: 14px; color: #666666; line-height: 1.7; margin-bottom: 28px; font-family: 'DM Sans', sans-serif;">
                Your AdmissionX profile is currently <strong style="color: #111111;">incomplete</strong>. To continue your admission process, please complete the following sections as soon as possible.
              </p>

              <!-- PROGRESS BAR -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; margin-bottom: 28px; border-collapse: collapse;">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                      <tr>
                        <td align="left" style="font-size: 13px; font-weight: 500; color: #333333; font-family: 'DM Sans', sans-serif;">
                          Profile Completion
                        </td>
                        <td align="right" style="font-size: 13px; font-weight: 600; color: #D91A1A; font-family: 'DM Sans', sans-serif;">
                          ${progressPercent}% Done
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="height: 8px; background-color: #F0EFEB; border-radius: 100px; overflow: hidden; padding: 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="${progressPercent}%" style="width: ${progressPercent}%; height: 8px; background-color: #D91A1A; border-radius: 100px; border-collapse: collapse;">
                      <tr><td style="height: 8px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11.5px; color: #AAAAAA; padding-top: 8px; font-family: 'DM Sans', sans-serif;">
                    Complete all 4 sections to submit your application
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

              <!-- PENDING SECTIONS -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">
                Pending Sections
              </div>

              <!-- STEPS GRID -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <tr>
                  <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                    <!--[if mso]>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                    <td width="260" valign="top" style="padding-right: 10px; padding-bottom: 12px;">
                    <![endif]-->
                    <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                      ${personalDetailsCard}
                    </div>
                    <!--[if mso]>
                    </td>
                    <td width="260" valign="top" style="padding-left: 10px; padding-bottom: 12px;">
                    <![endif]-->
                    <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                    <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                      ${academicInfoCard}
                    </div>
                    <!--[if mso]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                  </td>
                </tr>
                <tr><td class="benefits-sep" style="height: 12px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                <tr>
                  <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                    <!--[if mso]>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                    <td width="260" valign="top" style="padding-right: 10px;">
                    <![endif]-->
                    <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                      ${documentUploadCard}
                    </div>
                    <!--[if mso]>
                    </td>
                    <td width="260" valign="top" style="padding-left: 10px;">
                    <![endif]-->
                    <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                    <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                      ${coursePreferencesCard}
                    </div>
                    <!--[if mso]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                  </td>
                </tr>
              </table>

              <!-- URGENCY ALERT -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFF8F8; border-top: 1px solid #FFDADA; border-right: 1px solid #FFDADA; border-bottom: 1px solid #FFDADA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/info.png" alt="alert" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #8B1A1A; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #6B0E0E; display: block; margin-bottom: 2px; font-weight: bold;">Don't miss out!</strong>
                    Complete your profile today to avoid delays in your admission process. Incomplete profiles may miss application deadlines.
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <tr>
                  <td align="center" style="text-align: center;">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #D91A1A; color: #FFFFFF !important; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; padding: 14px 36px; border-radius: 10px; text-decoration: none; letter-spacing: 0.02em;">
                      Complete My Profile &rarr;
                    </a>
                    <div style="font-size: 11.5px; color: #BBBBBB; margin-top: 10px; font-family: 'DM Sans', sans-serif;">
                      Login to admissionx.com to continue
                    </div>
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">
              Why AdmissionX
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <!--[if mso]>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                  <td width="262" valign="top" style="padding-right: 8px;">
                  <![endif]-->
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Students
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Apply to multiple universities in one place</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time application status tracking</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Secure digital document management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Expert counselling &amp; guidance support</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">100% paperless admission process</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  <td width="262" valign="top" style="padding-left: 8px;">
                  <![endif]-->
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Colleges
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Centralized student application dashboard</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Automated document verification system</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Instant communication with applicants</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time seat &amp; enrollment management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Data-driven admission analytics</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
              Connect with us
            </div>
            
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <!-- Facebook -->
              <a href="https://facebook.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="facebook" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Facebook</span>
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="instagram" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Instagram</span>
              </a>
              <!-- Twitter/X -->
              <a href="https://twitter.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">X (Twitter)</span>
              </a>
              <!-- YouTube -->
              <a href="https://youtube.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="youtube" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">YouTube</span>
              </a>
            </div>
          </td>
        </tr>

        <!-- FOOTER STRIP -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <!--[if mso]>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                        <td width="260" valign="top">
                        <![endif]-->
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">
                            This is an automated email. Please do not reply directly to this message.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        <td width="260" valign="top" align="right">
                        <![endif]-->
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">
                            © 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Action Required: Complete Your AdmissionX Profile",
    html: template,
  });
}

export async function sendApplicationStartedEmail(
  to: string,
  name: string,
  appId: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Application Started Email</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  @media only screen and (max-width: 600px) {
    .email-outer {
      width: 100% !important;
    }
    .brand-logo-cell {
      padding-left: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .brand-tagline-cell {
      padding-right: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .email-card-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 28px !important;
      padding-bottom: 20px !important;
    }
    .benefits-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 24px !important;
      padding-bottom: 8px !important;
    }
    .social-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell .col-stack {
      text-align: center !important;
      margin-bottom: 8px !important;
    }
    .footer-text-right {
      text-align: center !important;
    }
    .col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-bottom: 12px !important;
    }
    .benefits-col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .benefits-sep {
      display: none !important;
    }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      
      <!-- MASTER CONTAINER TABLE -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">
        
        <!-- BRAND STRIP / HEADER -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">
              
              <!-- STATUS BADGE -->
              <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 24px; display: inline-block;">
                <tr>
                  <td valign="middle" style="line-height: 1;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                  </td>
                  <td valign="middle" style="font-size: 12px; color: #D91A1A; font-weight: 500; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                    Application Initiated
                  </td>
                </tr>
              </table>

              <!-- GREETING -->
              <div style="font-size: 22px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; margin-bottom: 10px; line-height: 1.3;">
                Dear <strong style="color: #D91A1A;">${escapeHtml(name)}</strong>,
              </div>
              
              <!-- HEADLINE & SUBLINE -->
              <p style="font-size: 15px; color: #444444; line-height: 1.7; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">
                Welcome on board <strong style="color: #111111;">AdmissionX</strong>.
              </p>
              <p style="font-size: 14px; color: #666666; line-height: 1.7; margin-bottom: 28px; font-family: 'DM Sans', sans-serif;">
                Your admission application process has been <strong style="color: #111111;">initiated successfully</strong>.
              </p>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

              <!-- APPLICATION ID -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">
                Your Application ID
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 22px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <!-- Left Details -->
                        <td align="left" valign="middle">
                          <span style="font-size: 10px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 4px; font-family: 'DM Sans', sans-serif;">
                            Application ID
                          </span>
                          <span style="font-size: 24px; font-weight: 600; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">
                            ${escapeHtml(appId)}
                          </span>
                        </td>
                        <!-- Right Icon -->
                        <td align="right" valign="middle" width="44">
                          <div style="width: 44px; height: 44px; border-radius: 10px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 44px;">
                            <img src="https://img.icons8.com/material-outlined/20/D91A1A/file.png" alt="ID" width="20" height="20" style="width: 20px; height: 20px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TIMELINE -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 18px; font-family: 'DM Sans', sans-serif;">
                Application Progress
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <!-- Circles and Lines Row -->
                <tr>
                  <!-- Step 1 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 1-2 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 2 Circle (Active) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #111111; border: 2px solid #111111; color: #D91A1A; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      2
                    </div>
                  </td>
                  <!-- Line 2-3 (Pending: grey) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #F0EFEB; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 3 Circle (Pending) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #FFFFFF; border: 2px solid #F0EFEB; color: #BBBBBB; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      3
                    </div>
                  </td>
                  <!-- Line 3-4 (Pending: grey) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #F0EFEB; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 4 Circle (Pending) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #FFFFFF; border: 2px solid #F0EFEB; color: #BBBBBB; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      4
                    </div>
                  </td>
                </tr>
                
                <!-- Spacer Row -->
                <tr>
                  <td colspan="7" style="height: 8px; line-height: 8px; font-size: 1px;">&nbsp;</td>
                </tr>

                <!-- Labels Row -->
                <tr>
                  <!-- Step 1 Label -->
                  <td align="center" valign="top" width="80" style="width: 80px; font-size: 11px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Application Started
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 2 Label -->
                  <td align="center" valign="top" width="80" style="width: 80px; font-size: 11px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Fill Details &amp; Upload Docs
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 3 Label -->
                  <td align="center" valign="top" width="80" style="width: 80px; font-size: 11px; color: #888888; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Submit Application
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 4 Label -->
                  <td align="center" valign="top" width="80" style="width: 80px; font-size: 11px; color: #888888; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Review &amp; Confirmation
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

              <!-- WHAT'S NEXT -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">
                What's Next
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <!-- Step 1 -->
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #F5F5F2;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="top" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: #FAFAF8; border: 1px solid #EEECEA; text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/user.png" alt="user" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="top" style="text-align: left;">
                          <div style="font-size: 13.5px; font-weight: 600; color: #111111; margin-bottom: 2px; font-family: 'DM Sans', sans-serif;">
                            Complete Required Sections
                          </div>
                          <div style="font-size: 12.5px; color: #888888; line-height: 1.5; font-family: 'DM Sans', sans-serif;">
                            Fill in your personal, academic, and course preference details
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Step 2 -->
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #F5F5F2;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="top" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: #FAFAF8; border: 1px solid #EEECEA; text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/upload.png" alt="upload" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="top" style="text-align: left;">
                          <div style="font-size: 13.5px; font-weight: 600; color: #111111; margin-bottom: 2px; font-family: 'DM Sans', sans-serif;">
                            Upload Your Documents
                          </div>
                          <div style="font-size: 12.5px; color: #888888; line-height: 1.5; font-family: 'DM Sans', sans-serif;">
                            Submit certificates, ID proof, and required academic records
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Step 3 -->
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="top" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: #FAFAF8; border: 1px solid #EEECEA; text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/checked-checkbox.png" alt="submit" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="top" style="text-align: left;">
                          <div style="font-size: 13.5px; font-weight: 600; color: #111111; margin-bottom: 2px; font-family: 'DM Sans', sans-serif;">
                            Submit &amp; Track
                          </div>
                          <div style="font-size: 12.5px; color: #888888; line-height: 1.5; font-family: 'DM Sans', sans-serif;">
                            Submit your application and track its status anytime on AdmissionX
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #555555; line-height: 1.7; margin-bottom: 24px; font-family: 'DM Sans', sans-serif;">
                Please complete all required sections and upload your documents to proceed further.
              </p>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">
              Why AdmissionX
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <!--[if mso]>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                  <td width="262" valign="top" style="padding-right: 8px;">
                  <![endif]-->
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Students
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Apply to multiple universities in one place</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time application status tracking</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Secure digital document management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Expert counselling &amp; guidance support</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">100% paperless admission process</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  <td width="262" valign="top" style="padding-left: 8px;">
                  <![endif]-->
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Colleges
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Centralized student application dashboard</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Automated document verification system</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Instant communication with applicants</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time seat &amp; enrollment management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Data-driven admission analytics</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
              Connect with us
            </div>
            
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <!-- Facebook -->
              <a href="https://facebook.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="facebook" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Facebook</span>
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="instagram" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Instagram</span>
              </a>
              <!-- Twitter/X -->
              <a href="https://twitter.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">X (Twitter)</span>
              </a>
              <!-- YouTube -->
              <a href="https://youtube.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="youtube" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">YouTube</span>
              </a>
            </div>
          </td>
        </tr>

        <!-- FOOTER STRIP -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <!--[if mso]>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                        <td width="260" valign="top">
                        <![endif]-->
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">
                            This is an automated email. Please do not reply directly to this message.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        <td width="260" valign="top" align="right">
                        <![endif]-->
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">
                            © 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Application Started - AdmissionX",
    html: template,
  });
}

export async function sendApplicationSubmittedEmail(
  to: string,
  name: string,
  appId: string,
  courseName: string,
  collegeName: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Application Submitted Email</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  @media only screen and (max-width: 600px) {
    .email-outer {
      width: 100% !important;
    }
    .brand-logo-cell {
      padding-left: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .brand-tagline-cell {
      padding-right: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .email-card-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 28px !important;
      padding-bottom: 20px !important;
    }
    .benefits-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 24px !important;
      padding-bottom: 8px !important;
    }
    .social-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell .col-stack {
      text-align: center !important;
      margin-bottom: 8px !important;
    }
    .footer-text-right {
      text-align: center !important;
    }
    .col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-bottom: 12px !important;
    }
    .benefits-col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .benefits-sep {
      display: none !important;
    }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      
      <!-- MASTER CONTAINER TABLE -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">
        
        <!-- BRAND STRIP / HEADER -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">
              
              <!-- CELEBRATION HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/checked-checkbox.png" alt="success" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px; font-size: 24px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Congratulations, <strong style="color: #D91A1A;">${escapeHtml(name)}</strong>!
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 14px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    Your application has been submitted successfully through AdmissionX.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

              <!-- APPLICATION DETAILS -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">
                Application Details
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Row 1: Application ID -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/file.png" alt="ID" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Application ID
                          </div>
                          <div style="font-size: 14px; color: #D91A1A; font-weight: 600; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.02em;">
                            ${escapeHtml(appId)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 2: Course -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="Course" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Course
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(courseName)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 3: University -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="University" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            University
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(collegeName)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TIMELINE -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 18px; font-family: 'DM Sans', sans-serif;">
                Application Progress
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <!-- Circles and Lines Row -->
                <tr>
                  <!-- Step 1 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 1-2 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 2 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 2-3 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 3 Circle (Active) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #111111; border: 2px solid #111111; color: #D91A1A; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      3
                    </div>
                  </td>
                  <!-- Line 3-4 (Pending: grey) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #F0EFEB; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 4 Circle (Pending) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #FFFFFF; border: 2px solid #F0EFEB; color: #BBBBBB; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      4
                    </div>
                  </td>
                </tr>
                
                <!-- Spacer Row -->
                <tr>
                  <td colspan="7" style="height: 8px; line-height: 8px; font-size: 1px;">&nbsp;</td>
                </tr>

                <!-- Labels Row -->
                <tr>
                  <!-- Step 1 Label -->
                  <td align="center" valign="top" width="80" style="width: 80px; font-size: 11px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Application Started
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 2 Label -->
                  <td align="center" valign="top" width="80" style="width: 80px; font-size: 11px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Details &amp; Docs Submitted
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 3 Label -->
                  <td align="center" valign="top" width="80" style="width: 80px; font-size: 11px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Under Review
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 4 Label -->
                  <td align="center" valign="top" width="80" style="width: 80px; font-size: 11px; color: #888888; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Admission Decision
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/clock.png" alt="clock" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">What happens next?</strong>
                    Our admission team will review your application shortly. You'll be notified of any updates directly through AdmissionX.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">
              Why AdmissionX
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <!--[if mso]>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                  <td width="262" valign="top" style="padding-right: 8px;">
                  <![endif]-->
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Students
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Apply to multiple universities in one place</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time application status tracking</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Secure digital document management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Expert counselling &amp; guidance support</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">100% paperless admission process</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  <td width="262" valign="top" style="padding-left: 8px;">
                  <![endif]-->
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Colleges
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Centralized student application dashboard</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Automated document verification system</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Instant communication with applicants</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time seat &amp; enrollment management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Data-driven admission analytics</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
              Connect with us
            </div>
            
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <!-- Facebook -->
              <a href="https://facebook.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="facebook" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Facebook</span>
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="instagram" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Instagram</span>
              </a>
              <!-- Twitter/X -->
              <a href="https://twitter.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">X (Twitter)</span>
              </a>
              <!-- YouTube -->
              <a href="https://youtube.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="youtube" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">YouTube</span>
              </a>
            </div>
          </td>
        </tr>

        <!-- FOOTER STRIP -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <!--[if mso]>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                        <td width="260" valign="top">
                        <![endif]-->
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">
                            This is an automated email. Please do not reply directly to this message.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        <td width="260" valign="top" align="right">
                        <![endif]-->
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">
                            © 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Application Submitted Successfully - AdmissionX",
    html: template,
  });
}

export async function sendDocumentsVerifiedEmail(
  to: string,
  name: string,
  appId: string = "APP-2026-88094",
  courseName: string = "B.Tech - Computer Science",
  collegeName: string = "Amity University"
): Promise<void> {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Documents Verified</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  @media only screen and (max-width: 600px) {
    .email-outer {
      width: 100% !important;
    }
    .brand-logo-cell {
      padding-left: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .brand-tagline-cell {
      padding-right: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .email-card-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 28px !important;
      padding-bottom: 20px !important;
    }
    .benefits-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 24px !important;
      padding-bottom: 8px !important;
    }
    .social-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell .col-stack {
      text-align: center !important;
      margin-bottom: 8px !important;
    }
    .footer-text-right {
      text-align: center !important;
    }
    .col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-bottom: 12px !important;
    }
    .benefits-col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .benefits-sep {
      display: none !important;
    }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      
      <!-- MASTER CONTAINER TABLE -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">
        
        <!-- BRAND STRIP / HEADER -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">
              
              <!-- CELEBRATION HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/checked-checkbox.png" alt="success" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <!-- STATUS BADGE -->
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Documents Verified
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Great News, <strong style="color: #D91A1A;">${escapeHtml(name)}</strong>!
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    Your uploaded documents have been successfully verified on AdmissionX.<br>You may now proceed to the next stage of your admission process.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- APPLICATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <!-- Left Details -->
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">
                            Application ID
                          </span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">
                            ${escapeHtml(appId)}
                          </span>
                        </td>
                        <!-- Right Icon -->
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- DOCUMENT STATUS DETAILS -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">
                Document Status
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Row 1: Status -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/checked-checkbox.png" alt="Verified" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Status
                          </div>
                          <div style="font-size: 14px; color: #D91A1A; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            Verified Successfully
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 2: Course -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="Course" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Course
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(courseName)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 3: University -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="University" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            University
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(collegeName)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TIMELINE -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 18px; font-family: 'DM Sans', sans-serif;">
                Application Progress
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <!-- Circles and Lines Row -->
                <tr>
                  <!-- Step 1 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 1-2 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 2 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 2-3 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 3 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 3-4 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 4 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 4-5 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 5 Circle (Active) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #111111; border: 2px solid #111111; color: #D91A1A; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      5
                    </div>
                  </td>
                </tr>
                
                <!-- Spacer Row -->
                <tr>
                  <td colspan="9" style="height: 8px; line-height: 8px; font-size: 1px;">&nbsp;</td>
                </tr>

                <!-- Labels Row -->
                <tr>
                  <!-- Step 1 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Application Started
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 2 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Details Submitted
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 3 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Documents Uploaded
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 4 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Documents Verified
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 5 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Under Review
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/clock.png" alt="clock" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">What happens next?</strong>
                    Your application is now one step closer to the final decision. Our team will continue the review process and keep you updated.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Thank you for choosing AdmissionX.</strong>
                Best Regards,<br>
                Team AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">
              Why AdmissionX
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <!--[if mso]>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                  <td width="262" valign="top" style="padding-right: 8px;">
                  <![endif]-->
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Students
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Apply to multiple universities in one place</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time application status tracking</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Secure digital document management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Expert counselling &amp; guidance support</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">100% paperless admission process</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  <td width="262" valign="top" style="padding-left: 8px;">
                  <![endif]-->
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Colleges
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Centralized student application dashboard</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Automated document verification system</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Instant communication with applicants</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time seat &amp; enrollment management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Data-driven admission analytics</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
              Connect with us
            </div>
            
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <!-- Facebook -->
              <a href="https://facebook.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="facebook" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Facebook</span>
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="instagram" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Instagram</span>
              </a>
              <!-- Twitter/X -->
              <a href="https://twitter.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">X (Twitter)</span>
              </a>
              <!-- YouTube -->
              <a href="https://youtube.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="youtube" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">YouTube</span>
              </a>
            </div>
          </td>
        </tr>

        <!-- FOOTER STRIP -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <!--[if mso]>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                        <td width="260" valign="top">
                        <![endif]-->
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">
                            This is an automated email. Please do not reply directly to this message.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        <td width="260" valign="top" align="right">
                        <![endif]-->
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">
                            © 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Documents Verified - AdmissionX",
    html: template,
  });
}

export async function sendDocumentsRejectedEmail(
  to: string,
  name: string,
  reason: string,
  appId: string = "APP-2026-88094"
): Promise<void> {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Documents Require Attention</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  @media only screen and (max-width: 600px) {
    .email-outer {
      width: 100% !important;
    }
    .brand-logo-cell {
      padding-left: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .brand-tagline-cell {
      padding-right: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .email-card-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 28px !important;
      padding-bottom: 20px !important;
    }
    .benefits-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 24px !important;
      padding-bottom: 8px !important;
    }
    .social-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell .col-stack {
      text-align: center !important;
      margin-bottom: 8px !important;
    }
    .footer-text-right {
      text-align: center !important;
    }
    .col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-bottom: 12px !important;
    }
    .benefits-col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .benefits-sep {
      display: none !important;
    }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      
      <!-- MASTER CONTAINER TABLE -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">
        
        <!-- BRAND STRIP / HEADER -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">
              
              <!-- CELEBRATION HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/high-priority.png" alt="attention required" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <!-- STATUS BADGE -->
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Action Required
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Attention, <strong style="color: #D91A1A;">${escapeHtml(name)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    Some of your uploaded documents require correction or re-upload.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- APPLICATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <!-- Left Details -->
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">
                            Application ID
                          </span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">
                            ${escapeHtml(appId)}
                          </span>
                        </td>
                        <!-- Right Icon -->
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- DOCUMENT STATUS DETAILS -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">
                Document Status
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Row 1: Status -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/high-priority.png" alt="Attention Required" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Status
                          </div>
                          <div style="font-size: 14px; color: #D91A1A; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            Requires Correction
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 2: Reason -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/file.png" alt="Reason" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Reason
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(reason)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TIMELINE -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 18px; font-family: 'DM Sans', sans-serif;">
                Application Progress
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <!-- Circles and Lines Row -->
                <tr>
                  <!-- Step 1 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 1-2 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 2 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 2-3 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 3 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 3-4 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 4 Circle (Active Warning !) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #111111; border: 2px solid #111111; color: #D91A1A; font-size: 14px; font-weight: 700; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      !
                    </div>
                  </td>
                  <!-- Line 4-5 (Pending: grey) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #F0EFEB; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 5 Circle (Pending) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #FFFFFF; border: 2px solid #F0EFEB; color: #BBBBBB; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      5
                    </div>
                  </td>
                </tr>
                
                <!-- Spacer Row -->
                <tr>
                  <td colspan="9" style="height: 8px; line-height: 8px; font-size: 1px;">&nbsp;</td>
                </tr>

                <!-- Labels Row -->
                <tr>
                  <!-- Step 1 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Application Started
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 2 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Details Submitted
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 3 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Documents Uploaded
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 4 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Documents Verification
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 5 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #888888; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Under Review
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/high-priority.png" alt="warning" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">Next Step</strong>
                    Please login to your AdmissionX account and upload the corrected documents at the earliest so we can continue your application process.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">
              Why AdmissionX
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <!--[if mso]>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                  <td width="262" valign="top" style="padding-right: 8px;">
                  <![endif]-->
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Students
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Apply to multiple universities in one place</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time application status tracking</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Secure digital document management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Expert counselling &amp; guidance support</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">100% paperless admission process</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  <td width="262" valign="top" style="padding-left: 8px;">
                  <![endif]-->
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Colleges
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Centralized student application dashboard</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Automated document verification system</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Instant communication with applicants</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time seat &amp; enrollment management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Data-driven admission analytics</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
              Connect with us
            </div>
            
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <!-- Facebook -->
              <a href="https://facebook.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="facebook" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Facebook</span>
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="instagram" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Instagram</span>
              </a>
              <!-- Twitter/X -->
              <a href="https://twitter.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">X (Twitter)</span>
              </a>
              <!-- YouTube -->
              <a href="https://youtube.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="youtube" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">YouTube</span>
              </a>
            </div>
          </td>
        </tr>

        <!-- FOOTER STRIP -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <!--[if mso]>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                        <td width="260" valign="top">
                        <![endif]-->
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">
                            This is an automated email. Please do not reply directly to this message.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        <td width="260" valign="top" align="right">
                        <![endif]-->
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">
                            © 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Documents Require Attention - AdmissionX",
    html: template,
  });
}


export async function sendPaymentSuccessEmail(
  to: string,
  name: string,
  amount: string,
  transactionId: string,
  date: string,
  collegeName: string,
  courseName: string,
  appId: string = "APP-2026-88094"
): Promise<void> {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Payment Successful</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  @media only screen and (max-width: 600px) {
    .email-outer {
      width: 100% !important;
    }
    .brand-logo-cell {
      padding-left: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .brand-tagline-cell {
      padding-right: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .email-card-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 28px !important;
      padding-bottom: 20px !important;
    }
    .benefits-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 24px !important;
      padding-bottom: 8px !important;
    }
    .social-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell .col-stack {
      text-align: center !important;
      margin-bottom: 8px !important;
    }
    .footer-text-right {
      text-align: center !important;
    }
    .col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-bottom: 12px !important;
    }
    .benefits-col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .benefits-sep {
      display: none !important;
    }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      
      <!-- MASTER CONTAINER TABLE -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">
        
        <!-- BRAND STRIP / HEADER -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">
              
              <!-- CELEBRATION HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/checked-checkbox.png" alt="success" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <!-- STATUS BADGE -->
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Payment Successful
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Thank You, <strong style="color: #D91A1A;">${escapeHtml(name)}</strong>!
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    Your payment has been received successfully.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- APPLICATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <!-- Left Details -->
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">
                            Application ID
                          </span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">
                            ${escapeHtml(appId)}
                          </span>
                        </td>
                        <!-- Right Icon -->
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PAYMENT DETAILS -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">
                Payment Details
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Row 1: College -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="College" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            College
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(collegeName)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 2: Course -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="Course" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Course
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(courseName)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 3: Amount -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/rupee.png" alt="Amount" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Amount
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ₹${escapeHtml(amount)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 4: Transaction ID -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/banknotes.png" alt="Transaction ID" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Transaction ID
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(transactionId)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 5: Date -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/calendar.png" alt="Date" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Date
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(date)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TIMELINE -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 18px; font-family: 'DM Sans', sans-serif;">
                Application Progress
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <!-- Circles and Lines Row -->
                <tr>
                  <!-- Step 1 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 1-2 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 2 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 2-3 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 3 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 3-4 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 4 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 4-5 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 5 Circle (Active) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #111111; border: 2px solid #111111; color: #D91A1A; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      5
                    </div>
                  </td>
                </tr>
                
                <!-- Spacer Row -->
                <tr>
                  <td colspan="9" style="height: 8px; line-height: 8px; font-size: 1px;">&nbsp;</td>
                </tr>

                <!-- Labels Row -->
                <tr>
                  <!-- Step 1 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Application Started
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 2 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Details Submitted
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 3 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Documents Verified
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 4 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Payment Done
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 5 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Under Review
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/clock.png" alt="clock" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">What happens next?</strong>
                    Your payment has been confirmed. The institution will now proceed with the final review of your application. You will be notified once a decision is made.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Thank you for completing your payment through AdmissionX.</strong>
                Best Regards,<br>
                Team AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">
              Why AdmissionX
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <!--[if mso]>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                  <td width="262" valign="top" style="padding-right: 8px;">
                  <![endif]-->
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Students
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Apply to multiple universities in one place</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time application status tracking</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Secure digital document management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Expert counselling &amp; guidance support</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">100% paperless admission process</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  <td width="262" valign="top" style="padding-left: 8px;">
                  <![endif]-->
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Colleges
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Centralized student application dashboard</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Automated document verification system</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Instant communication with applicants</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time seat &amp; enrollment management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Data-driven admission analytics</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
              Connect with us
            </div>
            
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <!-- Facebook -->
              <a href="https://facebook.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="facebook" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Facebook</span>
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="instagram" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Instagram</span>
              </a>
              <!-- Twitter/X -->
              <a href="https://twitter.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">X (Twitter)</span>
              </a>
              <!-- YouTube -->
              <a href="https://youtube.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="youtube" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">YouTube</span>
              </a>
            </div>
          </td>
        </tr>

        <!-- FOOTER STRIP -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <!--[if mso]>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                        <td width="260" valign="top">
                        <![endif]-->
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">
                            This is an automated email. Please do not reply directly to this message.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        <td width="260" valign="top" align="right">
                        <![endif]-->
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">
                            © 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Payment Successful - AdmissionX",
    html: template,
  });
}
export async function sendCollegeStudentEnrolledEmail(
  to: string,
  collegeName: string,
  studentName: string,
  appId: string,
  courseName: string,
  amountPaid: string,
  transactionId: string
): Promise<void> {
  const dashboardUrl = `${getBaseUrl()}/dashboard/college`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Student Enrolled</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .brand-logo-cell { padding-left: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .brand-tagline-cell { padding-right: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .email-card-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 28px !important; padding-bottom: 20px !important; }
    .benefits-section-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; padding-bottom: 8px !important; }
    .social-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-text-right { text-align: center !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 12px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">

        <!-- BRAND STRIP -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">

              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/school.png" alt="School" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Student Enrolled
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    New Enrollment, <strong style="color: #D91A1A;">${escapeHtml(collegeName)}</strong>!
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    We are pleased to inform you that a student has successfully completed their payment and enrolled in your institution.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- DETAILS LABEL -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif; text-align: left;">Enrollment Details</div>

              <!-- DETAILS BOX -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Student Name -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/user.png" alt="User" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Student Name</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">${escapeHtml(studentName)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Course Enrolled -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/education.png" alt="Course" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Course Enrolled</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">${escapeHtml(courseName)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Application ID -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/file.png" alt="ID" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Application ID</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">${escapeHtml(appId)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Amount Paid -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/rupee.png" alt="Rupees" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Amount Paid</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">₹${escapeHtml(amountPaid)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Transaction ID -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/tag.png" alt="Txn" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Transaction ID</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">${escapeHtml(transactionId)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- BUTTON -->
              <div style="text-align: center; margin: 36px 0 30px;">
                <a href="${dashboardUrl}" style="display: inline-block; background: #D91A1A; color: #ffffff !important; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(217,26,26,0.25); font-family: 'DM Sans', sans-serif;">Go to Dashboard</a>
              </div>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX<br>
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">Why AdmissionX</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                           <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                           <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Students</td>
                         </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Apply to multiple universities in one place</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time application status tracking</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Secure digital document management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Expert counselling &amp; guidance support</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Colleges</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Centralized student application dashboard</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Automated document verification system</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Instant communication with applicants</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time seat &amp; enrollment management</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">Connect with us</div>
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <a href="https://facebook.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="fb" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Facebook</span></a>
              <a href="https://instagram.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="ig" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Instagram</span></a>
              <a href="https://twitter.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">X (Twitter)</span></a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">This is an automated email. Please do not reply directly to this message.</div>
                        </div>
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: `New Student Enrollment Notification - ${collegeName}`,
    html,
  });
}

export async function sendPaymentFailedEmail(
  to: string,
  name: string,
  appId: string = "APP-2026-88094"
): Promise<void> {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Payment Failed</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  @media only screen and (max-width: 600px) {
    .email-outer {
      width: 100% !important;
    }
    .brand-logo-cell {
      padding-left: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .brand-tagline-cell {
      padding-right: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .email-card-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 28px !important;
      padding-bottom: 20px !important;
    }
    .benefits-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 24px !important;
      padding-bottom: 8px !important;
    }
    .social-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell .col-stack {
      text-align: center !important;
      margin-bottom: 8px !important;
    }
    .footer-text-right {
      text-align: center !important;
    }
    .col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-bottom: 12px !important;
    }
    .benefits-col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .benefits-sep {
      display: none !important;
    }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      
      <!-- MASTER CONTAINER TABLE -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">
        
        <!-- BRAND STRIP / HEADER -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">
              
              <!-- CELEBRATION HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/high-priority.png" alt="failed" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <!-- STATUS BADGE -->
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Payment Failed
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Payment Issue, <strong style="color: #D91A1A;">${escapeHtml(name)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    We were unable to process your recent payment attempt on AdmissionX.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- APPLICATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <!-- Left Details -->
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">
                            Application ID
                          </span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">
                            ${escapeHtml(appId)}
                          </span>
                        </td>
                        <!-- Right Icon -->
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PAYMENT STATUS DETAILS -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">
                Payment Status
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Row: Status -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/high-priority.png" alt="Failed" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Status
                          </div>
                          <div style="font-size: 14px; color: #D91A1A; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            Payment Failed
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TIMELINE -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 18px; font-family: 'DM Sans', sans-serif;">
                Application Progress
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <!-- Circles and Lines Row -->
                <tr>
                  <!-- Step 1 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 1-2 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 2 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 2-3 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 3 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 3-4 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 4 Circle (Active Warning: !) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #111111; border: 2px solid #111111; color: #D91A1A; font-size: 14px; font-weight: 700; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      !
                    </div>
                  </td>
                  <!-- Line 4-5 (Pending: grey) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #F0EFEB; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 5 Circle (Pending) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #FFFFFF; border: 2px solid #F0EFEB; color: #BBBBBB; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      5
                    </div>
                  </td>
                </tr>
                
                <!-- Spacer Row -->
                <tr>
                  <td colspan="9" style="height: 8px; line-height: 8px; font-size: 1px;">&nbsp;</td>
                </tr>

                <!-- Labels Row -->
                <tr>
                  <!-- Step 1 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Application Started
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 2 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Details Submitted
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 3 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Documents Verified
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 4 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Payment
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 5 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #888888; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Under Review
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/high-priority.png" alt="Failed" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">What to do next?</strong>
                    Please try making the payment again from your AdmissionX dashboard. If the issue persists, contact our support team for assistance.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">
              Why AdmissionX
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <!--[if mso]>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                  <td width="262" valign="top" style="padding-right: 8px;">
                  <![endif]-->
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Students
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Apply to multiple universities in one place</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time application status tracking</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Secure digital document management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Expert counselling &amp; guidance support</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">100% paperless admission process</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  <td width="262" valign="top" style="padding-left: 8px;">
                  <![endif]-->
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Colleges
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Centralized student application dashboard</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Automated document verification system</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Instant communication with applicants</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time seat &amp; enrollment management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Data-driven admission analytics</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
              Connect with us
            </div>
            
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <!-- Facebook -->
              <a href="https://facebook.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="facebook" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Facebook</span>
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="instagram" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Instagram</span>
              </a>
              <!-- Twitter/X -->
              <a href="https://twitter.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">X (Twitter)</span>
              </a>
              <!-- YouTube -->
              <a href="https://youtube.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="youtube" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">YouTube</span>
              </a>
            </div>
          </td>
        </tr>

        <!-- FOOTER STRIP -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <!--[if mso]>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                        <td width="260" valign="top">
                        <![endif]-->
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">
                            This is an automated email. Please do not reply directly to this message.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        <td width="260" valign="top" align="right">
                        <![endif]-->
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">
                            © 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Payment Failed - AdmissionX",
    html: template,
  });
}

export async function sendCounsellingScheduledEmail(
  to: string,
  name: string,
  date: string,
  time: string,
  venue: string,
  appId: string = "APP-2026-88094"
): Promise<void> {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Counselling Scheduled</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  @media only screen and (max-width: 600px) {
    .email-outer {
      width: 100% !important;
    }
    .brand-logo-cell {
      padding-left: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .brand-tagline-cell {
      padding-right: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .email-card-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 28px !important;
      padding-bottom: 20px !important;
    }
    .benefits-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 24px !important;
      padding-bottom: 8px !important;
    }
    .social-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell .col-stack {
      text-align: center !important;
      margin-bottom: 8px !important;
    }
    .footer-text-right {
      text-align: center !important;
    }
    .col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-bottom: 12px !important;
    }
    .benefits-col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .benefits-sep {
      display: none !important;
    }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      
      <!-- MASTER CONTAINER TABLE -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">
        
        <!-- BRAND STRIP / HEADER -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">
              
              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/calendar.png" alt="Counselling" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <!-- STATUS BADGE -->
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Counselling Scheduled
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    You're All Set, <strong style="color: #D91A1A;">${escapeHtml(name)}</strong>!
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    Your counselling session has been scheduled successfully.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- APPLICATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <!-- Left Details -->
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">
                            Application ID
                          </span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">
                            ${escapeHtml(appId)}
                          </span>
                        </td>
                        <!-- Right Icon -->
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- SESSION DETAILS -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">
                Session Details
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Row 1: Date -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/calendar.png" alt="Date" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Date
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(date)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 2: Time -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/clock.png" alt="Time" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Time
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(time)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 3: Mode -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/marker.png" alt="Mode" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Mode / Venue
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(venue)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TIMELINE -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 18px; font-family: 'DM Sans', sans-serif;">
                Application Progress
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <!-- Circles and Lines Row -->
                <tr>
                  <!-- Step 1 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 1-2 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 2 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 2-3 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 3 Circle (Done) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #D91A1A; border: 2px solid #D91A1A; color: #FFFFFF; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 3-4 (Done: red) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #D91A1A; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 4 Circle (Active: ✓, black background, red text) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #111111; border: 2px solid #111111; color: #D91A1A; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      ✓
                    </div>
                  </td>
                  <!-- Line 4-5 (Pending: grey) -->
                  <td valign="middle" style="padding: 0 4px;">
                    <div style="height: 2px; background-color: #F0EFEB; line-height: 2px; font-size: 1px;">&nbsp;</div>
                  </td>
                  <!-- Step 5 Circle (Pending) -->
                  <td align="center" valign="middle" width="28">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #FFFFFF; border: 2px solid #F0EFEB; color: #BBBBBB; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center; font-family: 'DM Sans', sans-serif;">
                      5
                    </div>
                  </td>
                </tr>
                
                <!-- Spacer Row -->
                <tr>
                  <td colspan="9" style="height: 8px; line-height: 8px; font-size: 1px;">&nbsp;</td>
                </tr>

                <!-- Labels Row -->
                <tr>
                  <!-- Step 1 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Application Started
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 2 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Documents Verified
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 3 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Payment Done
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 4 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #111111; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Counselling
                  </td>
                  <!-- Empty cell for line spacer -->
                  <td>&nbsp;</td>
                  <!-- Step 5 Label -->
                  <td align="center" valign="top" width="70" style="width: 70px; font-size: 10px; color: #888888; line-height: 1.4; font-family: 'DM Sans', sans-serif;">
                    Final Decision
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 28px 0; border: none;">

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/clock.png" alt="Info" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">Important</strong>
                    Please login to your AdmissionX account for meeting link (if online), guidelines, and preparation tips. Join the session on time.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">
              Why AdmissionX
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <!--[if mso]>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                  <td width="262" valign="top" style="padding-right: 8px;">
                  <![endif]-->
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Students
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Apply to multiple universities in one place</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time application status tracking</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Secure digital document management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Expert counselling &amp; guidance support</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">100% paperless admission process</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  <td width="262" valign="top" style="padding-left: 8px;">
                  <![endif]-->
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Colleges
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Centralized student application dashboard</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Automated document verification system</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Instant communication with applicants</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time seat &amp; enrollment management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Data-driven admission analytics</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
              Connect with us
            </div>
            
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <!-- Facebook -->
              <a href="https://facebook.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="facebook" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Facebook</span>
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="instagram" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Instagram</span>
              </a>
              <!-- Twitter/X -->
              <a href="https://twitter.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">X (Twitter)</span>
              </a>
              <!-- YouTube -->
              <a href="https://youtube.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="youtube" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">YouTube</span>
              </a>
            </div>
          </td>
        </tr>

        <!-- FOOTER STRIP -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <!--[if mso]>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                        <td width="260" valign="top">
                        <![endif]-->
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">
                            This is an automated email. Please do not reply directly to this message.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        <td width="260" valign="top" align="right">
                        <![endif]-->
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">
                            © 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Counselling Session Scheduled - AdmissionX",
    html: template,
  });
}

export async function sendSeatReservationEmail(
  to: string,
  name: string,
  courseName: string,
  collegeName: string,
  appId: string = "APP-2026-88094"
): Promise<void> {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Seat Reserved Successfully</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  @media only screen and (max-width: 600px) {
    .email-outer {
      width: 100% !important;
    }
    .brand-logo-cell {
      padding-left: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .brand-tagline-cell {
      padding-right: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .email-card-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 28px !important;
      padding-bottom: 20px !important;
    }
    .benefits-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 24px !important;
      padding-bottom: 8px !important;
    }
    .social-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell .col-stack {
      text-align: center !important;
      margin-bottom: 8px !important;
    }
    .footer-text-right {
      text-align: center !important;
    }
    .col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-bottom: 12px !important;
    }
    .benefits-col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .benefits-sep {
      display: none !important;
    }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      
      <!-- MASTER CONTAINER TABLE -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">
        
        <!-- BRAND STRIP / HEADER -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">
              
              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/checked-checkbox.png" alt="Reserved" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <!-- STATUS BADGE -->
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Seat Reserved
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Congratulations, <strong style="color: #D91A1A;">${escapeHtml(name)}</strong>!
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    Your seat has been successfully reserved.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- APPLICATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <!-- Left Details -->
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">
                            Application ID
                          </span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">
                            ${escapeHtml(appId)}
                          </span>
                        </td>
                        <!-- Right Icon -->
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- SEAT DETAILS -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">
                Seat Details
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Row 1: Course -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="Course" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Course
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(courseName)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 2: College -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="College" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            College / University
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(collegeName)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/clock.png" alt="Info" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">Next Steps</strong>
                    Please complete the remaining admission formalities within the given timeline. Login to your AdmissionX account to view the payment schedule and required documents.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">
              Why AdmissionX
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <!--[if mso]>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                  <td width="262" valign="top" style="padding-right: 8px;">
                  <![endif]-->
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Students
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Apply to multiple universities in one place</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time application status tracking</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Secure digital document management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Expert counselling &amp; guidance support</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">100% paperless admission process</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  <td width="262" valign="top" style="padding-left: 8px;">
                  <![endif]-->
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Colleges
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Centralized student application dashboard</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Automated document verification system</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Instant communication with applicants</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time seat &amp; enrollment management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Data-driven admission analytics</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
              Connect with us
            </div>
            
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <!-- Facebook -->
              <a href="https://facebook.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="facebook" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Facebook</span>
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="instagram" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Instagram</span>
              </a>
              <!-- Twitter/X -->
              <a href="https://twitter.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">X (Twitter)</span>
              </a>
              <!-- YouTube -->
              <a href="https://youtube.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="youtube" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">YouTube</span>
              </a>
            </div>
          </td>
        </tr>

        <!-- FOOTER STRIP -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <!--[if mso]>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                        <td width="260" valign="top">
                        <![endif]-->
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">
                            This is an automated email. Please do not reply directly to this message.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        <td width="260" valign="top" align="right">
                        <![endif]-->
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">
                            © 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Seat Reserved - AdmissionX",
    html: template,
  });
}

export async function sendAdmissionConfirmationEmail(
  to: string,
  name: string,
  courseName: string,
  collegeName: string,
  enrollmentId: string,
  appId: string = "APP-2026-88094"
): Promise<void> {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Admission Confirmed</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  @media only screen and (max-width: 600px) {
    .email-outer {
      width: 100% !important;
    }
    .brand-logo-cell {
      padding-left: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .brand-tagline-cell {
      padding-right: 16px !important;
      padding-top: 16px !important;
      padding-bottom: 14px !important;
    }
    .email-card-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 28px !important;
      padding-bottom: 20px !important;
    }
    .benefits-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
      padding-top: 24px !important;
      padding-bottom: 8px !important;
    }
    .social-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .footer-section-cell .col-stack {
      text-align: center !important;
      margin-bottom: 8px !important;
    }
    .footer-text-right {
      text-align: center !important;
    }
    .col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-bottom: 12px !important;
    }
    .benefits-col-stack {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .benefits-sep {
      display: none !important;
    }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      
      <!-- MASTER CONTAINER TABLE -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">
        
        <!-- BRAND STRIP / HEADER -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">
              
              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/graduation-cap.png" alt="Admission Confirmed" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <!-- STATUS BADGE -->
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Admission Confirmed
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Congratulations & Welcome, <strong style="color: #D91A1A;">${escapeHtml(name)}</strong>!
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    Your admission has been confirmed successfully. You're now officially part of the AdmissionX community.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- APPLICATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <!-- Left Details -->
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">
                            Application ID
                          </span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">
                            ${escapeHtml(appId)}
                          </span>
                        </td>
                        <!-- Right Icon -->
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ADMISSION DETAILS -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">
                Admission Details
              </div>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Row 1: Student Name -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/user.png" alt="Student Name" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Student Name
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(name)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 2: Course -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="Course" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Course
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(courseName)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 3: University -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="College" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            University
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(collegeName)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Row 4: Enrollment No -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217, 26, 26, 0.12); border: 1px solid rgba(217, 26, 26, 0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/checked-checkbox.png" alt="Enrollment ID" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">
                            Enrollment No
                          </div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">
                            ${escapeHtml(enrollmentId)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/info.png" alt="Welcome" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">Welcome Aboard!</strong>
                    We wish you a successful academic journey and a bright future ahead. Login to your AdmissionX account for important documents, orientation details, and further instructions.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">
              Why AdmissionX
            </div>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <!--[if mso]>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                  <td width="262" valign="top" style="padding-right: 8px;">
                  <![endif]-->
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Students
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Apply to multiple universities in one place</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time application status tracking</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Secure digital document management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Expert counselling &amp; guidance support</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">100% paperless admission process</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  <td width="262" valign="top" style="padding-left: 8px;">
                  <![endif]-->
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="30">
                                <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">
                                For Colleges
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 16px 18px 16px;">
                          <!-- Bullet Points -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Centralized student application dashboard</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Automated document verification system</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Instant communication with applicants</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Real-time seat &amp; enrollment management</td>
                            </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                              <td valign="top" width="10" style="font-size: 14px; line-height: 16px; color: #D91A1A; padding-right: 8px; font-family: 'DM Sans', sans-serif;">•</td>
                              <td valign="top" style="font-size: 12px; color: #555555; line-height: 1.5; font-family: 'DM Sans', sans-serif;">Data-driven admission analytics</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if mso]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">
              Connect with us
            </div>
            
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <!-- Facebook -->
              <a href="https://facebook.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="facebook" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Facebook</span>
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="instagram" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">Instagram</span>
              </a>
              <!-- Twitter/X -->
              <a href="https://twitter.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">X (Twitter)</span>
              </a>
              <!-- YouTube -->
              <a href="https://youtube.com/admissionx" style="display: inline-block; padding: 8px 16px; margin: 6px 8px; border-radius: 8px; border: 1px solid #EEECEA; text-decoration: none; font-size: 12px; color: #444444 !important; font-family: 'DM Sans', sans-serif; font-weight: 500; background-color: #FFFFFF; text-align: center; white-space: nowrap; vertical-align: middle;">
                <img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="youtube" width="14" height="14" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; border: 0; padding-right: 6px;">
                <span style="vertical-align: middle; color: #444444;">YouTube</span>
              </a>
            </div>
          </td>
        </tr>

        <!-- FOOTER STRIP -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <!--[if mso]>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                        <td width="260" valign="top">
                        <![endif]-->
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">
                            This is an automated email. Please do not reply directly to this message.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        <td width="260" valign="top" align="right">
                        <![endif]-->
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">
                            © 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.
                          </div>
                        </div>
                        <!--[if mso]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Admission Confirmed - Welcome to AdmissionX",
    html: template,
  });
}

export async function sendStudentApplicationStatusEmail(params: {
  to: string;
  studentName: string;
  collegeName: string;
  appId: string;
  courseName: string;
  status: string;
  reason: string | null;
}): Promise<void> {
  const { to, studentName, collegeName, appId, courseName, status, reason } = params;
  const dashboardUrl = `${getBaseUrl()}/dashboard/student`;
  
  let title = "Application Status Update";
  let message = "Your application status has been updated.";
  
  let badgeBg = "#FFF0F0";
  let badgeBorder = "#FFDADA";
  let badgeColor = "#D91A1A";
  let badgeText = "Updated";
  
  let heroBorderColor = "#FFDADA";
  let heroIconUrl = "https://img.icons8.com/material-outlined/28/D91A1A/info.png";
  
  if (status === "under_review") {
    title = "Application Under Review";
    message = "Your application is currently being reviewed by the college.";
    badgeBg = "#FEF3C7";
    badgeBorder = "#FEF3C7";
    badgeColor = "#D97706";
    badgeText = "Under Review";
    heroBorderColor = "#FEF3C7";
    heroIconUrl = "https://img.icons8.com/material-outlined/28/D97706/hourglass.png";
  } else if (status === "verified") {
    title = "Application Approved";
    message = "Congratulations! Your application has been approved by the college.";
    badgeBg = "#ECFDF5";
    badgeBorder = "#D1FAE5";
    badgeColor = "#059669";
    badgeText = "Approved";
    heroBorderColor = "#D1FAE5";
    heroIconUrl = "https://img.icons8.com/material-outlined/28/059669/checked-checkbox.png";
  } else if (status === "enrolled") {
    title = "Admission Confirmed";
    message = "Congratulations! Your admission has been successfully confirmed.";
    badgeBg = "#ECFDF5";
    badgeBorder = "#D1FAE5";
    badgeColor = "#059669";
    badgeText = "Enrolled";
    heroBorderColor = "#D1FAE5";
    heroIconUrl = "https://img.icons8.com/material-outlined/28/059669/checked-checkbox.png";
  } else if (status === "rejected") {
    title = "Application Status Update";
    message = "We regret to inform you that your application was not successful this time.";
    badgeBg = "#FEF2F2";
    badgeBorder = "#FEE2E2";
    badgeColor = "#DC2626";
    badgeText = "Not Approved";
    heroBorderColor = "#FEE2E2";
    heroIconUrl = "https://img.icons8.com/material-outlined/28/DC2626/cancel.png";
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Application Status Update</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .brand-logo-cell { padding-left: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .brand-tagline-cell { padding-right: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .email-card-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 28px !important; padding-bottom: 20px !important; }
    .benefits-section-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; padding-bottom: 8px !important; }
    .social-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-text-right { text-align: center !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 12px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">

        <!-- BRAND STRIP -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">

              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid ${heroBorderColor}; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="${heroIconUrl}" alt="Status" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${badgeColor}; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: ${badgeColor}; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          ${badgeText}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    ${title}
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    Dear <strong>${escapeHtml(studentName)}</strong>,<br>
                    ${message}
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- DETAILS LABEL -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif; text-align: left;">Application Details</div>

              <!-- DETAILS BOX -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid ${badgeColor}; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Application ID -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/file.png" alt="ID" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Application ID</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">${escapeHtml(appId)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Course -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/education.png" alt="Course" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Course</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">${escapeHtml(courseName)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- College -->
                <tr>
                  <td style="padding: 14px 20px; ${reason ? 'border-bottom: 1px solid rgba(255,255,255,0.06);' : ''}">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="College" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">College</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">${escapeHtml(collegeName)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Reason / Notes (Optional) -->
                ${reason ? `
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/info.png" alt="Note" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">College Remark</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">${escapeHtml(reason)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ""}
              </table>

              <!-- BUTTON -->
              <div style="text-align: center; margin: 36px 0 30px;">
                <a href="${dashboardUrl}" style="display: inline-block; background: #D91A1A; color: #ffffff !important; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(217,26,26,0.25); font-family: 'DM Sans', sans-serif;">View Application</a>
              </div>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX<br>
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">Why AdmissionX</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                           <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                           <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Students</td>
                         </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Apply to multiple universities in one place</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time application status tracking</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Secure digital document management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Expert counselling &amp; guidance support</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Colleges</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Centralized student application dashboard</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Automated document verification system</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Instant communication with applicants</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time seat &amp; enrollment management</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">Connect with us</div>
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <a href="https://facebook.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="fb" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Facebook</span></a>
              <a href="https://instagram.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="ig" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Instagram</span></a>
              <a href="https://twitter.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">X (Twitter)</span></a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">This is an automated email. Please do not reply directly to this message.</div>
                        </div>
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: `${title} - AdmissionX`,
    html,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// COLLEGE EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════

export async function sendCollegeRegistrationEmail(
  to: string,
  collegeName: string,
  contactName: string
): Promise<void> {
  const loginUrl = `${getBaseUrl()}/login/college`;
  const body = `
    <p>Dear <strong>${escapeHtml(contactName)}</strong>,</p>
    <p>Welcome to AdmissionX! Your institution <strong>${escapeHtml(collegeName)}</strong> has been successfully registered.</p>
    <a href="${loginUrl}" class="btn">Login to Dashboard</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Institution Registration Successful - AdmissionX",
    html: renderTemplate("Registration Successful", "Your institution is registered", body),
  });
}

export async function sendCollegeVerificationApprovedEmail(
  to: string,
  collegeName: string,
  dashboardUrl: string
): Promise<void> {
  const body = `
    <p>Dear Team <strong>${escapeHtml(collegeName)}</strong>,</p>
    <p>Congratulations! Your institution has been verified and approved on AdmissionX.</p>
    <p><span class="status">Approved</span></p>
    <a href="${dashboardUrl}" class="btn">Access Dashboard</a>
    <p class="sign">
      Best Regards,<br />
      <strong>Team AdmissionX</strong>
    </p>
  `;
  await sendMail({
    to,
    subject: "Institution Verification Approved - AdmissionX",
    html: renderTemplate("Verification Approved", "Your institution is verified", body),
  });
}

export async function sendCollegeVerificationPendingEmail(
  to: string,
  collegeName: string,
  requiredDocuments: string,
  registrationId: string = "REG-2026-00001"
): Promise<void> {
  // Format required documents as numbered list lines
  const docsHtml = escapeHtml(requiredDocuments)
    .split(/\n|,\s*/)
    .filter(Boolean)
    .map((doc, i) => `${i + 1}. ${doc.trim()}`)
    .join("<br>");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Additional Documents Required</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .brand-logo-cell { padding-left: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .brand-tagline-cell { padding-right: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .email-card-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 28px !important; padding-bottom: 20px !important; }
    .benefits-section-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; padding-bottom: 8px !important; }
    .social-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-text-right { text-align: center !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 12px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">

        <!-- BRAND STRIP -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">

              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/file.png" alt="Documents" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Action Required
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Additional Documents Needed, <strong style="color: #D91A1A;">${escapeHtml(collegeName)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    Please submit the required information to complete your institution verification.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- REGISTRATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">Registration ID</span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">${escapeHtml(registrationId)}</span>
                        </td>
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- REQUIRED DOCUMENTS LABEL -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">Required Documents / Details</div>

              <!-- REQUIRED DOCUMENTS BOX -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <div style="font-size: 14px; color: #FFFFFF; font-weight: 500; line-height: 1.8; font-family: 'DM Sans', sans-serif;">
                      ${docsHtml}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/info.png" alt="Next Steps" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">Next Steps</strong>
                    Please login to your AdmissionX institution dashboard and upload the requested documents at the earliest. Your verification process will resume once all documents are submitted.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Verification Team<br>AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">Why AdmissionX</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Students</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Apply to multiple universities in one place</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time application status tracking</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Secure digital document management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Expert counselling &amp; guidance support</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">100% paperless admission process</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Colleges</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Centralized student application dashboard</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Automated document verification system</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Instant communication with applicants</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time seat &amp; enrollment management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Data-driven admission analytics</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">Connect with us</div>
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <a href="https://facebook.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="fb" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Facebook</span></a>
              <a href="https://instagram.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="ig" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Instagram</span></a>
              <a href="https://twitter.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">X (Twitter)</span></a>
              <a href="https://youtube.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="yt" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">YouTube</span></a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">This is an automated email. Please do not reply directly to this message.</div>
                        </div>
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Additional Documents Required - AdmissionX",
    html,
  });
}

export async function sendNewApplicationNotificationToCollege(
  to: string,
  collegeName: string,
  studentName: string,
  appId: string,
  courseName: string
): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – New Student Application</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .brand-logo-cell { padding-left: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .brand-tagline-cell { padding-right: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .email-card-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 28px !important; padding-bottom: 20px !important; }
    .benefits-section-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; padding-bottom: 8px !important; }
    .social-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-text-right { text-align: center !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 12px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">

        <!-- BRAND STRIP -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">

              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/file.png" alt="Application" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          New Application
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    New Student Application, <strong style="color: #D91A1A;">${escapeHtml(collegeName)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    A new application has been received through AdmissionX.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- APPLICATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">Application ID</span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">${escapeHtml(appId)}</span>
                        </td>
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- DETAILS LABEL -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">Student Details</div>

              <!-- DETAILS BOX -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 4px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      
                      <!-- STUDENT NAME -->
                      <tr>
                        <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="32">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 32px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/user.png" alt="Student" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="padding-left: 12px;">
                                <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Student Name</span>
                                <span style="font-size: 14px; color: #FFFFFF; font-weight: 600; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif;">${escapeHtml(studentName)}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- COURSE APPLIED -->
                      <tr>
                        <td style="padding: 14px 20px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="32">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 32px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="Course" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="padding-left: 12px;">
                                <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Course Applied</span>
                                <span style="font-size: 14px; color: #FFFFFF; font-weight: 600; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif;">${escapeHtml(courseName)}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/info.png" alt="Action Required" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">Action Required</strong>
                    Please login to your institution dashboard to review the complete application, documents, and take necessary action.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX<br>
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">Why AdmissionX</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Students</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Apply to multiple universities in one place</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time application status tracking</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Secure digital document management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Expert counselling &amp; guidance support</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">100% paperless admission process</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Colleges</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Centralized student application dashboard</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Automated document verification system</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Instant communication with applicants</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time seat &amp; enrollment management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Data-driven admission analytics</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">Connect with us</div>
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <a href="https://facebook.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="fb" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Facebook</span></a>
              <a href="https://instagram.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="ig" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Instagram</span></a>
              <a href="https://twitter.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">X (Twitter)</span></a>
              <a href="https://youtube.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="yt" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">YouTube</span></a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">This is an automated email. Please do not reply directly to this message.</div>
                        </div>
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "New Student Application Received - AdmissionX",
    html,
  });
}

export async function sendAdmissionApprovalRequestToCollege(
  to: string,
  collegeName: string,
  studentName: string,
  appId: string,
  courseName: string
): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Admission Approval Request</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .brand-logo-cell { padding-left: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .brand-tagline-cell { padding-right: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .email-card-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 28px !important; padding-bottom: 20px !important; }
    .benefits-section-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; padding-bottom: 8px !important; }
    .social-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-text-right { text-align: center !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 12px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">

        <!-- BRAND STRIP -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">

              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/checked-checkbox.png" alt="Approval Request" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Approval Pending
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Admission Approval Request, <strong style="color: #D91A1A;">${escapeHtml(collegeName)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    A student application is waiting for your approval.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- APPLICATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">Application ID</span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">${escapeHtml(appId)}</span>
                        </td>
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- DETAILS LABEL -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">Student Application</div>

              <!-- DETAILS BOX -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 4px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      
                      <!-- STUDENT NAME -->
                      <tr>
                        <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="32">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 32px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/user.png" alt="Student" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="padding-left: 12px;">
                                <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Student Name</span>
                                <span style="font-size: 14px; color: #FFFFFF; font-weight: 600; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif;">${escapeHtml(studentName)}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- COURSE APPLIED -->
                      <tr>
                        <td style="padding: 14px 20px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="32">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 32px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="Course" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="padding-left: 12px;">
                                <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Course</span>
                                <span style="font-size: 14px; color: #FFFFFF; font-weight: 600; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif;">${escapeHtml(courseName)}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/info.png" alt="Action Required" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">Action Required</strong>
                    Please review the student's application, documents, and academic details in your AdmissionX dashboard and approve or reject the admission.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX<br>
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">Why AdmissionX</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Students</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Apply to multiple universities in one place</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time application status tracking</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Secure digital document management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Expert counselling &amp; guidance support</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">100% paperless admission process</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Colleges</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Centralized student application dashboard</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Automated document verification system</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Instant communication with applicants</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time seat &amp; enrollment management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Data-driven admission analytics</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">Connect with us</div>
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <a href="https://facebook.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="fb" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Facebook</span></a>
              <a href="https://instagram.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="ig" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Instagram</span></a>
              <a href="https://twitter.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">X (Twitter)</span></a>
              <a href="https://youtube.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="yt" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">YouTube</span></a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">This is an automated email. Please do not reply directly to this message.</div>
                        </div>
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Admission Approval Request - AdmissionX",
    html,
  });
}

export async function sendAdmissionApprovedNotificationToCollege(
  to: string,
  collegeName: string,
  studentName: string,
  courseName: string,
  appId: string
): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Admission Approved</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .brand-logo-cell { padding-left: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .brand-tagline-cell { padding-right: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .email-card-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 28px !important; padding-bottom: 20px !important; }
    .benefits-section-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; padding-bottom: 8px !important; }
    .social-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-text-right { text-align: center !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 12px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">

        <!-- BRAND STRIP -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">

              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/checked-checkbox.png" alt="Admission Confirmed" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Admission Approved
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Admission Confirmed, <strong style="color: #D91A1A;">${escapeHtml(collegeName)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    The student's admission has been successfully approved.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- APPLICATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">Application ID</span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">${escapeHtml(appId)}</span>
                        </td>
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- DETAILS LABEL -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">Approved Admission</div>

              <!-- DETAILS BOX -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 4px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      
                      <!-- STUDENT NAME -->
                      <tr>
                        <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="32">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 32px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/user.png" alt="Student" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="padding-left: 12px;">
                                <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Student Name</span>
                                <span style="font-size: 14px; color: #FFFFFF; font-weight: 600; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif;">${escapeHtml(studentName)}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- COURSE APPLIED -->
                      <tr>
                        <td style="padding: 14px 20px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="32">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 32px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="Course" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="padding-left: 12px;">
                                <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Course</span>
                                <span style="font-size: 14px; color: #FFFFFF; font-weight: 600; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif;">${escapeHtml(courseName)}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/info.png" alt="Student Notified" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">Student Notified</strong>
                    The student has been informed about the admission confirmation. Thank you for your continued partnership with AdmissionX.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX<br>
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">Why AdmissionX</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Students</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Apply to multiple universities in one place</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time application status tracking</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Secure digital document management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Expert counselling &amp; guidance support</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">100% paperless admission process</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Colleges</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Centralized student application dashboard</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Automated document verification system</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Instant communication with applicants</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time seat &amp; enrollment management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Data-driven admission analytics</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">Connect with us</div>
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <a href="https://facebook.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="fb" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Facebook</span></a>
              <a href="https://instagram.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="ig" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Instagram</span></a>
              <a href="https://twitter.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">X (Twitter)</span></a>
              <a href="https://youtube.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="yt" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">YouTube</span></a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">This is an automated email. Please do not reply directly to this message.</div>
                        </div>
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Admission Approved - AdmissionX",
    html,
  });
}

export async function sendAdmissionRejectedNotificationToCollege(
  to: string,
  collegeName: string,
  studentName: string,
  appId: string,
  reason: string,
  courseName: string = "General Admission"
): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Admission Rejected</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .brand-logo-cell { padding-left: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .brand-tagline-cell { padding-right: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .email-card-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 28px !important; padding-bottom: 20px !important; }
    .benefits-section-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; padding-bottom: 8px !important; }
    .social-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-text-right { text-align: center !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 12px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">

        <!-- BRAND STRIP -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">

              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/cancel.png" alt="Admission Rejected" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Admission Rejected
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Application Update, <strong style="color: #D91A1A;">${escapeHtml(collegeName)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    The following student application has been rejected / kept on hold.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- APPLICATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">Application ID</span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">${escapeHtml(appId)}</span>
                        </td>
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- DETAILS LABEL -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">Application Details</div>

              <!-- DETAILS BOX -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 4px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      
                      <!-- STUDENT NAME -->
                      <tr>
                        <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="32">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 32px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/user.png" alt="Student" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="padding-left: 12px;">
                                <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Student Name</span>
                                <span style="font-size: 14px; color: #FFFFFF; font-weight: 600; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif;">${escapeHtml(studentName)}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- COURSE APPLIED -->
                      <tr>
                        <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="32">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 32px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="Course" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="padding-left: 12px;">
                                <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Course</span>
                                <span style="font-size: 14px; color: #FFFFFF; font-weight: 600; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif;">${escapeHtml(courseName)}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- REASON -->
                      <tr>
                        <td style="padding: 14px 20px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td valign="middle" width="32">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 32px;">
                                  <img src="https://img.icons8.com/material-outlined/15/D91A1A/info.png" alt="Reason" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                                </div>
                              </td>
                              <td valign="middle" style="padding-left: 12px;">
                                <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Reason</span>
                                <span style="font-size: 14px; color: #FFFFFF; font-weight: 600; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif; line-height: 1.5;">${escapeHtml(reason)}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/info.png" alt="Student Notified" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">Student Notified</strong>
                    The applicant has been informed about the decision through AdmissionX. Thank you for using the platform.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX<br>
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">Why AdmissionX</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Students</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Apply to multiple universities in one place</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time application status tracking</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Secure digital document management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Expert counselling &amp; guidance support</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">100% paperless admission process</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Colleges</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Centralized student application dashboard</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Automated document verification system</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Instant communication with applicants</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time seat &amp; enrollment management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Data-driven admission analytics</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">Connect with us</div>
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <a href="https://facebook.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="fb" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Facebook</span></a>
              <a href="https://instagram.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="ig" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Instagram</span></a>
              <a href="https://twitter.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">X (Twitter)</span></a>
              <a href="https://youtube.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="yt" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">YouTube</span></a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">This is an automated email. Please do not reply directly to this message.</div>
                        </div>
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Admission Rejected - AdmissionX",
    html,
  });
}

export async function sendCollegeWelcomePartnerEmail(
  to: string,
  collegeName: string
): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Welcome Partner</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .brand-logo-cell { padding-left: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .brand-tagline-cell { padding-right: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .email-card-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 28px !important; padding-bottom: 20px !important; }
    .benefits-section-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; padding-bottom: 8px !important; }
    .social-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-text-right { text-align: center !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 12px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">

        <!-- BRAND STRIP -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">

              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/handshake.png" alt="Welcome Partner" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Partner Onboarded
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Welcome aboard, <strong style="color: #D91A1A;">${escapeHtml(collegeName)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    Thank you for joining AdmissionX — the future of digital admissions.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- WELCOME MESSAGE -->
              <div style="font-size: 15px; line-height: 1.8; color: #444444; margin-bottom: 24px; font-family: 'DM Sans', sans-serif; text-align: left;">
                Dear Team ${escapeHtml(collegeName)},<br><br>
                Welcome to <strong>AdmissionX</strong> — the world’s first online admission portal.<br><br>
                Together, we are building a smarter, faster, and fully digital admission ecosystem for students and institutions worldwide.
              </div>

              <!-- PARTNERSHIP BENEFITS -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-radius: 12px; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 24px;">
                    <strong style="color:#D91A1A; display:block; margin-bottom:12px; font-size: 15px; font-family: 'DM Sans', sans-serif; font-weight: bold;">Your institution can now seamlessly manage:</strong>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td valign="top" width="12" style="font-size: 14px; line-height: 1.8; color: #D91A1A; font-family: 'DM Sans', sans-serif;">✓</td>
                        <td style="font-size: 14.5px; line-height: 1.6; color: #FFFFFF; font-family: 'DM Sans', sans-serif; padding-left: 8px; padding-bottom: 8px;">Student onboarding</td>
                      </tr>
                      <tr>
                        <td valign="top" width="12" style="font-size: 14px; line-height: 1.8; color: #D91A1A; font-family: 'DM Sans', sans-serif;">✓</td>
                        <td style="font-size: 14.5px; line-height: 1.6; color: #FFFFFF; font-family: 'DM Sans', sans-serif; padding-left: 8px; padding-bottom: 8px;">Application management</td>
                      </tr>
                      <tr>
                        <td valign="top" width="12" style="font-size: 14px; line-height: 1.8; color: #D91A1A; font-family: 'DM Sans', sans-serif;">✓</td>
                        <td style="font-size: 14.5px; line-height: 1.6; color: #FFFFFF; font-family: 'DM Sans', sans-serif; padding-left: 8px; padding-bottom: 8px;">Admission processing</td>
                      </tr>
                      <tr>
                        <td valign="top" width="12" style="font-size: 14px; line-height: 1.8; color: #D91A1A; font-family: 'DM Sans', sans-serif;">✓</td>
                        <td style="font-size: 14.5px; line-height: 1.6; color: #FFFFFF; font-family: 'DM Sans', sans-serif; padding-left: 8px; padding-bottom: 8px;">Digital document verification</td>
                      </tr>
                      <tr>
                        <td valign="top" width="12" style="font-size: 14px; line-height: 1.8; color: #D91A1A; font-family: 'DM Sans', sans-serif;">✓</td>
                        <td style="font-size: 14.5px; line-height: 1.6; color: #FFFFFF; font-family: 'DM Sans', sans-serif; padding-left: 8px;">Real-time communication with applicants</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 12px; font-weight: bold;">We look forward to a successful and long-term partnership.</strong>
                Best Regards,<br>
                Team AdmissionX<br>
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">Why Partner with AdmissionX</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/user.png" alt="students" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Students</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Apply to multiple universities in one place</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time application tracking</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">100% paperless process</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Colleges</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Centralized application dashboard</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Automated verification system</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time analytics &amp; reporting</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">Connect with us</div>
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <a href="https://facebook.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="fb" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Facebook</span></a>
              <a href="https://instagram.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="ig" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Instagram</span></a>
              <a href="https://twitter.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">X (Twitter)</span></a>
              <a href="https://youtube.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="yt" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">YouTube</span></a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">This is an automated email. Please do not reply directly to this message.</div>
                        </div>
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Welcome to AdmissionX Partner Network",
    html,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// ACTIVATION & SIGNUP CONFIRMATION EMAILS
// ═══════════════════════════════════════════════════════════════════════

export async function sendStudentActivationEmail(
  to: string,
  name: string,
  activationLink: string
): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Account Activation</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .brand-logo-cell { padding-left: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .brand-tagline-cell { padding-right: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .email-card-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 28px !important; padding-bottom: 20px !important; }
    .benefits-section-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; padding-bottom: 8px !important; }
    .social-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-text-right { text-align: center !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 12px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">

        <!-- BRAND STRIP -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">

              <!-- BADGE -->
              <div align="left">
                <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 24px; display: inline-block;">
                  <tr>
                    <td valign="middle" style="line-height: 1;">
                      <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                    </td>
                    <td valign="middle" style="font-size: 12px; color: #D91A1A; font-weight: 500; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                      Account Activation Required
                    </td>
                  </tr>
                </table>
              </div>

              <!-- GREETING -->
              <div style="font-size: 22px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; margin-bottom: 10px; line-height: 1.3; text-align: left;">
                Dear <strong style="color: #D91A1A;">${escapeHtml(name)}</strong>,
              </div>
              <div style="font-size: 15px; color: #444444; line-height: 1.7; margin-bottom: 6px; font-family: 'DM Sans', sans-serif; text-align: left;">
                Thank you for registering with <strong style="color: #111111;">AdmissionX</strong>.
              </div>
              <div style="font-size: 14px; color: #666666; line-height: 1.7; margin-bottom: 28px; font-family: 'DM Sans', sans-serif; text-align: left;">
                To complete your registration and begin your university application journey, please activate your account.
              </div>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 24px 0; border: none;">

              <!-- BUTTON -->
              <div style="text-align: center; margin: 36px 0 30px;">
                <a href="${activationLink}" style="display: inline-block; background: #D91A1A; color: #ffffff !important; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(217,26,26,0.25); font-family: 'DM Sans', sans-serif;">Activate Your Account</a>
                <p style="font-size: 12px; color: #888888; margin-top: 14px; font-family: 'DM Sans', sans-serif;">This activation link will expire in 24 hours.</p>
              </div>

              <div style="font-size: 14px; color: #666666; line-height: 1.7; margin-bottom: 28px; font-family: 'DM Sans', sans-serif; text-align: left;">
                If you did not request this account, please ignore this email.
              </div>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 24px 0; border: none;">

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX<br>
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">Why AdmissionX</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Students</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Apply to multiple universities in one place</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time application status tracking</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Secure digital document management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Expert counselling &amp; guidance support</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Colleges</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Centralized student application dashboard</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Automated document verification system</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Instant communication with applicants</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time seat &amp; enrollment management</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">Connect with us</div>
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <a href="https://facebook.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="fb" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Facebook</span></a>
              <a href="https://instagram.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="ig" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Instagram</span></a>
              <a href="https://twitter.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">X (Twitter)</span></a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">This is an automated email. Please do not reply directly to this message.</div>
                        </div>
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Activate Your AdmissionX Account",
    html,
  });
}

export async function sendCollegeSignupConfirmationEmail(
  to: string,
  collegeName: string,
  contactName: string,
  registrationId: string = "REG-2026-00001"
): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Institution Registration Received</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .brand-logo-cell { padding-left: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .brand-tagline-cell { padding-right: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .email-card-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 28px !important; padding-bottom: 20px !important; }
    .benefits-section-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; padding-bottom: 8px !important; }
    .social-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-text-right { text-align: center !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 12px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">

        <!-- BRAND STRIP -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">

              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/building.png" alt="Institution" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Registration Received
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Welcome to AdmissionX, <strong style="color: #D91A1A;">${escapeHtml(collegeName)}</strong>!
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    Your institution registration request has been received successfully.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- REGISTRATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">Registration ID</span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">${escapeHtml(registrationId)}</span>
                        </td>
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- WHAT YOU CAN DO LABEL -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">What You Can Do After Approval</div>

              <!-- CAPABILITIES BOX -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Receive Applications -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/user.png" alt="Applications" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Receive Applications</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">From qualified students</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Manage Admissions -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/building.png" alt="Admissions" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Manage Admissions</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">Completely online</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Real-time Tracking -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/combo-chart.png" alt="Analytics" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Real-time Tracking</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">Application status &amp; analytics</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/clock.png" alt="Next Steps" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">Next Steps</strong>
                    Our verification team will review your submitted details and documents shortly. You will receive another email once your institution is approved and activated.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Partnership Team<br>AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">Why AdmissionX</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Students</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Apply to multiple universities in one place</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time application status tracking</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Secure digital document management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Expert counselling &amp; guidance support</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">100% paperless admission process</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Colleges</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Centralized student application dashboard</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Automated document verification system</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Instant communication with applicants</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time seat &amp; enrollment management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Data-driven admission analytics</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">Connect with us</div>
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <a href="https://facebook.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="fb" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Facebook</span></a>
              <a href="https://instagram.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="ig" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Instagram</span></a>
              <a href="https://twitter.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">X (Twitter)</span></a>
              <a href="https://youtube.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="yt" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">YouTube</span></a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">This is an automated email. Please do not reply directly to this message.</div>
                        </div>
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Institution Registration Received - AdmissionX",
    html,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetLink: string,
  role: "student" | "college" | "admin"
): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Password Reset Request</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .brand-logo-cell { padding-left: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .brand-tagline-cell { padding-right: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .email-card-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 28px !important; padding-bottom: 20px !important; }
    .benefits-section-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; padding-bottom: 8px !important; }
    .social-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-text-right { text-align: center !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 12px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">

        <!-- BRAND STRIP -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">

              <!-- BADGE -->
              <div align="left">
                <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 24px; display: inline-block;">
                  <tr>
                    <td valign="middle" style="line-height: 1;">
                      <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                    </td>
                    <td valign="middle" style="font-size: 12px; color: #D91A1A; font-weight: 500; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                      Password Reset Request
                    </td>
                  </tr>
                </table>
              </div>

              <!-- GREETING -->
              <div style="font-size: 22px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; margin-bottom: 10px; line-height: 1.3; text-align: left;">
                Dear <strong style="color: #D91A1A;">${escapeHtml(name)}</strong>,
              </div>
              <div style="font-size: 15px; color: #444444; line-height: 1.7; margin-bottom: 6px; font-family: 'DM Sans', sans-serif; text-align: left;">
                We received a request to reset your password for your AdmissionX <strong style="color: #111111;">${escapeHtml(role)}</strong> account.
              </div>
              <div style="font-size: 14px; color: #666666; line-height: 1.7; margin-bottom: 28px; font-family: 'DM Sans', sans-serif; text-align: left;">
                Click the button below to choose a new password. If you didn't request a password reset, you can safely ignore this email.
              </div>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 24px 0; border: none;">

              <!-- BUTTON -->
              <div style="text-align: center; margin: 36px 0 30px;">
                <a href="${resetLink}" style="display: inline-block; background: #D91A1A; color: #ffffff !important; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(217,26,26,0.25); font-family: 'DM Sans', sans-serif;">Reset Password</a>
                <p style="font-size: 12px; color: #888888; margin-top: 14px; font-family: 'DM Sans', sans-serif;">This password reset link will expire in 15 minutes.</p>
              </div>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 24px 0; border: none;">

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX<br>
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">Why AdmissionX</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                           <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                           <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Students</td>
                         </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Apply to multiple universities in one place</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time application status tracking</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Secure digital document management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Expert counselling &amp; guidance support</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Colleges</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Centralized student application dashboard</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Automated document verification system</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Instant communication with applicants</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time seat &amp; enrollment management</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">Connect with us</div>
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <a href="https://facebook.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="fb" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Facebook</span></a>
              <a href="https://instagram.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="ig" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Instagram</span></a>
              <a href="https://twitter.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">X (Twitter)</span></a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">This is an automated email. Please do not reply directly to this message.</div>
                        </div>
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Reset Your AdmissionX Password",
    html,
  });
}

export async function sendCollegeApprovalEmail(
  to: string,
  collegeName: string,
  contactName: string,
  tempPassword: string,
  registrationId: string = "REG-2026-00001"
): Promise<void> {
  const loginUrl = `${getBaseUrl()}/login/college`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdmissionX – Institution Verified Successfully</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-outer { width: 100% !important; }
    .brand-logo-cell { padding-left: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .brand-tagline-cell { padding-right: 16px !important; padding-top: 16px !important; padding-bottom: 14px !important; }
    .email-card-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 28px !important; padding-bottom: 20px !important; }
    .benefits-section-cell { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; padding-bottom: 8px !important; }
    .social-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-section-cell { padding-left: 16px !important; padding-right: 16px !important; }
    .footer-text-right { text-align: center !important; }
    .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 12px !important; }
    .benefits-col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
    .benefits-sep { display: none !important; }
  }
</style>
</head>
<body style="background-color: #F2F2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #F2F2F0; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <td align="center" style="padding: 40px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 620px; margin: 0 auto; border-collapse: collapse; table-layout: fixed;" align="center" class="email-outer">

        <!-- BRAND STRIP -->
        <tr>
          <td align="center" style="background-color: #FFFFFF; border-radius: 12px 12px 0 0; border-bottom: 1px solid #F0EFEB; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td colspan="2" style="height: 5px; background-color: #D91A1A; line-height: 5px; font-size: 1px;">&nbsp;</td>
              </tr>
              <tr>
                <td align="left" valign="middle" class="brand-logo-cell" style="padding: 20px 0 18px 32px;">
                  <img src="${getPublicLogoUrl()}" alt="AdmissionX Logo" style="height: 26px; width: auto; display: block; border: 0;">
                </td>
                <td align="right" valign="middle" class="brand-tagline-cell" style="padding: 20px 32px 18px 0; font-size: 10px; color: #666666; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; font-family: 'DM Sans', sans-serif; font-weight: 500;">
                  World's First Online<br>Admission Portal
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN EMAIL CARD -->
        <tr>
          <td class="email-card-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 40px 40px 36px;">

              <!-- HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #FFDADA; background-color: transparent; text-align: center; line-height: 64px; display: inline-block;">
                      <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #111111; display: inline-block; vertical-align: middle; line-height: 60px; text-align: center;">
                        <img src="https://img.icons8.com/material-outlined/28/D91A1A/layers.png" alt="Verified" width="28" height="28" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; border: 0;">
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF0F0; border: 1px solid #FFDADA; border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 14px; display: inline-block;">
                      <tr>
                        <td valign="middle" style="line-height: 1;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #D91A1A; display: inline-block; vertical-align: middle;"></div>
                        </td>
                        <td valign="middle" style="font-size: 11px; color: #D91A1A; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; padding-left: 7px; line-height: 1;">
                          Institution Verified
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 26px; font-family: 'DM Serif Display', Georgia, serif; color: #111111; line-height: 1.3;">
                    Congratulations, <strong style="color: #D91A1A;">${escapeHtml(collegeName)}</strong>!
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 15px; color: #666666; line-height: 1.7; font-family: 'DM Sans', sans-serif;">
                    Your institution has been successfully verified on AdmissionX.
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <hr style="height: 1px; background-color: #F0EFEB; margin: 32px 0; border: none;">

              <!-- REGISTRATION ID HERO -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="left" valign="middle">
                          <span style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 6px; font-family: 'DM Sans', sans-serif;">Registration ID</span>
                          <span style="font-size: 22px; font-weight: 700; color: #D91A1A; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">${escapeHtml(registrationId)}</span>
                        </td>
                        <td align="right" valign="middle" width="40">
                          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 40px;">
                            <img src="https://img.icons8.com/material-outlined/18/D91A1A/file.png" alt="ID" width="18" height="18" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- LOGIN CREDENTIALS LABEL -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">Login Credentials</div>

              <!-- CREDENTIALS BOX -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Temporary Password -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/lock.png" alt="Password" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Temporary Password</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', Courier, monospace; letter-spacing: 0.04em;">${escapeHtml(tempPassword)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Portal Link -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/link.png" alt="Portal" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Portal Link</div>
                          <div style="font-size: 14px; color: #D91A1A; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em; word-break: break-all;"><a href="${escapeHtml(loginUrl)}" style="color: #D91A1A; text-decoration: none;">${escapeHtml(loginUrl)}</a></div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Email -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/email.png" alt="Email" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Email</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em; word-break: break-all;">${escapeHtml(to)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- YOU CAN NOW LABEL -->
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 14px; font-family: 'DM Sans', sans-serif;">You Can Now</div>

              <!-- CAPABILITIES BOX -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #111111; border-top: 3px solid #D91A1A; border-radius: 12px; border-collapse: separate; margin-bottom: 28px; width: 100%;">
                <!-- Accept Applications -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/user.png" alt="Applications" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Accept Applications</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">From qualified students</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Manage Workflows -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/building.png" alt="Workflows" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Manage Workflows</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">Full admission control</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Communicate & Update -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td valign="middle" width="32" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(217,26,26,0.12); border: 1px solid rgba(217,26,26,0.25); text-align: center; line-height: 30px;">
                            <img src="https://img.icons8.com/material-outlined/15/D91A1A/combo-chart.png" alt="Communicate" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                          </div>
                        </td>
                        <td valign="middle" align="left">
                          <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; font-family: 'DM Sans', sans-serif;">Communicate &amp; Update</div>
                          <div style="font-size: 14px; color: #FFFFFF; font-weight: 600; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;">Courses &amp; seat availability</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- INFO NOTE -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FAFAF8; border-top: 1px solid #EEECEA; border-right: 1px solid #EEECEA; border-bottom: 1px solid #EEECEA; border-left: 3px solid #D91A1A; border-radius: 0 10px 10px 0; padding: 14px 16px; margin-bottom: 28px; border-collapse: collapse; box-sizing: border-box;">
                <tr>
                  <td valign="top" width="30" style="padding-right: 12px;">
                    <div style="width: 30px; height: 30px; background-color: #FFF0F0; border-radius: 8px; text-align: center; line-height: 30px;">
                      <img src="https://img.icons8.com/material-outlined/15/D91A1A/info.png" alt="Welcome" width="15" height="15" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; border: 0;">
                    </div>
                  </td>
                  <td valign="middle" style="font-size: 13px; color: #555555; line-height: 1.6; font-family: 'DM Sans', sans-serif; text-align: left;">
                    <strong style="color: #111111; display: block; margin-bottom: 2px; font-weight: bold;">Welcome Aboard!</strong>
                    You are now part of the AdmissionX partner network. Login to your portal and start exploring the dashboard. Please change your temporary password after first login for security.
                  </td>
                </tr>
              </table>

              <!-- SIGNOFF -->
              <div style="font-size: 14px; color: #333333; line-height: 1.8; font-family: 'DM Sans', sans-serif; text-align: left;">
                <strong style="color: #111111; font-size: 15px; display: block; margin-bottom: 2px; font-weight: bold;">Best Regards,</strong>
                Team AdmissionX
                <span style="font-size: 11.5px; color: #AAAAAA; letter-spacing: 0.02em; margin-top: 2px; display: block; font-family: 'DM Sans', sans-serif;">World's First Online Admission Portal</span>
              </div>

          </td>
        </tr>

        <!-- BENEFITS SECTION -->
        <tr>
          <td class="benefits-section-cell" style="background-color: #FAFAF8; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; padding: 32px 40px 16px 40px;">
            <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #AAAAAA; margin-bottom: 20px; text-align: center; font-family: 'DM Sans', sans-serif;">Why AdmissionX</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/graduation-cap.png" alt="students" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Students</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Apply to multiple universities in one place</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time application status tracking</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Secure digital document management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Expert counselling &amp; guidance support</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">100% paperless admission process</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                  <span class="benefits-sep" style="display: inline-block; width: 8px; height: 1px;"></span>
                  <div class="benefits-col-stack" style="display: inline-block; width: 100%; max-width: 262px; vertical-align: top; text-align: left;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EEECEA; border-radius: 12px; width: 100%; margin-bottom: 16px; border-collapse: collapse;">
                      <tr><td style="padding: 18px 16px 12px 16px; border-bottom: 1px solid #F0EFEB;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;"><tr>
                          <td valign="middle" width="30"><div style="width: 30px; height: 30px; border-radius: 8px; background-color: #111111; text-align: center; line-height: 30px;"><img src="https://img.icons8.com/material-outlined/15/D91A1A/school.png" alt="colleges" width="15" height="15" style="width:15px;height:15px;display:inline-block;vertical-align:middle;border:0;"></div></td>
                          <td valign="middle" style="font-size: 13px; font-weight: 600; color: #111111; padding-left: 8px; font-family: 'DM Sans', sans-serif;">For Colleges</td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding: 14px 16px 18px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Centralized student application dashboard</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Automated document verification system</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Instant communication with applicants</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Real-time seat &amp; enrollment management</td></tr></table>
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td valign="top" width="10" style="font-size:14px;line-height:16px;color:#D91A1A;padding-right:8px;font-family:'DM Sans',sans-serif;">•</td><td valign="top" style="font-size:12px;color:#555555;line-height:1.5;font-family:'DM Sans',sans-serif;">Data-driven admission analytics</td></tr></table>
                      </td></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOCIAL LINKS -->
        <tr>
          <td align="center" class="social-section-cell" style="background-color: #FFFFFF; border-left: 1px solid #E8E8E4; border-right: 1px solid #E8E8E4; border-top: 1px solid #F0EFEB; padding: 24px 16px;">
            <div style="font-size: 11px; color: #AAAAAA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; font-weight: 600;">Connect with us</div>
            <div style="text-align: center; font-family: 'DM Sans', sans-serif;">
              <a href="https://facebook.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/facebook.png" alt="fb" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Facebook</span></a>
              <a href="https://instagram.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/instagram.png" alt="ig" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">Instagram</span></a>
              <a href="https://twitter.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/twitterx.png" alt="x" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">X (Twitter)</span></a>
              <a href="https://youtube.com/admissionx" style="display:inline-block;padding:8px 16px;margin:6px 8px;border-radius:8px;border:1px solid #EEECEA;text-decoration:none;font-size:12px;color:#444444;font-family:'DM Sans',sans-serif;font-weight:500;background-color:#FFFFFF;white-space:nowrap;vertical-align:middle;"><img src="https://img.icons8.com/ios-glyphs/14/111111/youtube.png" alt="yt" width="14" height="14" style="width:14px;height:14px;display:inline-block;vertical-align:middle;border:0;padding-right:6px;"><span style="vertical-align:middle;color:#444444;">YouTube</span></a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#0D0D0D" class="footer-section-cell" style="background-color: #0D0D0D; border-radius: 0 0 12px 12px; border-left: 1px solid #222222; border-right: 1px solid #222222; border-bottom: 1px solid #222222; overflow: hidden; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 24px 32px 20px 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="font-size: 0; text-align: center; padding: 0;">
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: left;">
                          <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6;">This is an automated email. Please do not reply directly to this message.</div>
                        </div>
                        <span class="benefits-sep" style="display: inline-block; width: 12px; height: 1px;"></span>
                        <div class="col-stack" style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top; text-align: right;">
                          <div class="footer-text-right" style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: #888888; line-height: 1.6; text-align: right;">© 2026 <span style="color: #D91A1A; font-weight: 500;">AdmissionX</span>. All rights reserved.</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height: 3px; background-color: #D91A1A; line-height: 3px; font-size: 1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendMail({
    to,
    subject: "Institution Verified Successfully - AdmissionX",
    html,
  });
}
