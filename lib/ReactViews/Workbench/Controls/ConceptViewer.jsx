"use strict";

import SummaryConcept from "./SummaryConcept/SummaryConcept";
import Concept from "./Concept";
import ObserveModelMixin from "../../ObserveModelMixin";
import SummaryConceptModel from "../../../Map/SummaryConcept";

import React from "react";
import createReactClass from "create-react-class";
import PropTypes from "prop-types";
import Styles from "./concept-viewer.scss";

const ConceptViewer = createReactClass({
  displayName: "ConceptViewer",
  mixins: [ObserveModelMixin],

  propTypes: {
    item: PropTypes.object.isRequired
  },

  render() {
    // All non-additive-conditions go in a single section. (If there are none, don't show a <div class=section> so we don't get an extra padding.)
    // Each additive-condition goes in its own section.
    const nonSummaryConcept = this.props.item.concepts.filter(
      concept =>
        concept.isVisible &&
        !SummaryConceptModel.prototype.isPrototypeOf(concept)
    );

    return (
      <div className={Styles.root}>
        <If condition={nonSummaryConcept.length > 0}>
          <div className={Styles.section}>
            <For each="concept" index="i" of={nonSummaryConcept}>
              <div className={Styles.inner} key={i}>
                <ul className={Styles.childrenList}>
                  <Concept
                    concept={concept}
                    isLoading={this.props.item.isLoading}
                  />
                </ul>
              </div>
            </For>
          </div>
        </If>
        <For
          each="concept"
          index="i"
          of={this.props.item.concepts.filter(
            concept =>
              concept.isVisible &&
              SummaryConceptModel.prototype.isPrototypeOf(concept)
          )}
        >
          <div className={Styles.section} key={i}>
            <ul className={Styles.childrenList}>
              <SummaryConcept
                concept={concept}
                isLoading={this.props.item.isLoading}
              />
            </ul>
          </div>
        </For>
      </div>
    );
  }
});

module.exports = ConceptViewer;
