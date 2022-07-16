# SCIoT SS22 Group 30 DWA (AI Planner)

## Solver

The PDDL solver we used is the publicly available online planning service provided at [PDDL Solver](http://solver.planning.domains/). Note that the planner does not support more complex PDDL features from PDDL 2 upwards (e.g. numeric fluents, metrics, preferences).

## PDDL Files

The `domain.pddl` and `problem_template.pddl` files for our AI planner are located inside `../dashboard-web-app/services/ai-planner` as the AI planner is invoked by the DWA backend.

## Development and Testing

First, add the following extension to your VS Code:

- [PDDL Extension](https://marketplace.visualstudio.com/items?itemName=jan-dolejsi.pddl)

Then open the directory `../dashboard-web-app/services/ai-planner` in VS Code. If you are prompted to install a validator, accept installing the `VAL` validator. After that, make sure that in the testing tab the domain and example problem files are recognized correctly. You can then edit the domain file or create new example problem files with the help of the excellent IDE support from the PDDL extension. You can then directly run the tests from inside this Testing tab which will use the online PDDL solver service for executing.
