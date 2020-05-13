"use strict";

import classNames from "classnames";
import defined from "terriajs-cesium/Source/Core/defined";
import knockout from "terriajs-cesium/Source/ThirdParty/knockout";
import Loader from "../../Loader.jsx";
import ObserveModelMixin from "../../ObserveModelMixin";
import proxyCatalogItemUrl from "../../../Models/proxyCatalogItemUrl";
import React from "react";
import createReactClass from "create-react-class";
import PropTypes from "prop-types";
import URI from "urijs";
import Styles from "./legend.scss";

const Legend = createReactClass({
  displayName: "Legend",
  mixins: [ObserveModelMixin],

  propTypes: {
    item: PropTypes.object
  },

  /* eslint-disable-next-line camelcase */
  UNSAFE_componentWillMount() {
    this.legendsWithError = {};
  },

  onImageError(legend) {
    this.legendsWithError[legend.url] = true;
  },

  doesLegendHaveError(legend) {
    const hasError = this.legendsWithError[legend.url];
    if (!defined(hasError)) {
      this.legendsWithError[legend.url] = false;
      knockout.track(this.legendsWithError, [legend.url]);
    }
    return this.legendsWithError[legend.url];
  },

  renderLegend(legendUrl, i) {
    const isImage = legendUrl.isImage();
    const insertDirectly = !!legendUrl.safeSvgContent; // we only insert content we generated ourselves, not arbitrary SVG from init files.

    const svg = legendUrl.safeSvgContent;
    // Safari xlink NS issue fix
    const processedSvg = svg ? svg.replace(/NS\d+:href/gi, "xlink:href") : null;
    const safeSvgContent = { __html: processedSvg };

    // We proxy the legend so it's cached, and so that the Print/Export feature works with non-CORS servers.
    // We make it absolute because the print view is opened on a different domain (about:blank) so relative
    // URLs will not work.
    const proxiedUrl = makeAbsolute(
      proxyCatalogItemUrl(this.props.item, legendUrl.url)
    );

    return (
      <Choose>
        <When condition={isImage && insertDirectly}>
          <li
            key={i}
            onError={this.onImageError.bind(this, legendUrl)}
            className={classNames(Styles.legendSvg, {
              [Styles.legendImagehasError]: this.doesLegendHaveError(legendUrl)
            })}
            dangerouslySetInnerHTML={safeSvgContent}
          />
        </When>
        <When condition={isImage}>
          <li
            key={proxiedUrl}
            className={classNames({
              [Styles.legendImagehasError]: this.doesLegendHaveError(legendUrl)
            })}
          >
            <a
              onError={this.onImageError.bind(this, legendUrl)}
              href={proxiedUrl}
              className={Styles.imageAnchor}
              target="_blank"
              rel="noreferrer noopener"
            >
              <img src={proxiedUrl} />
            </a>
          </li>
        </When>
        <Otherwise>
          <li key={proxiedUrl}>
            <a href={proxiedUrl} target="_blank" rel="noreferrer noopener">
              Open legend in a separate tab
            </a>
          </li>
        </Otherwise>
      </Choose>
    );
  },

  render() {
    return (
      <ul className={Styles.legend}>
        <div className={Styles.legendInner}>
          <Choose>
            <When condition={this.props.item.isLoading}>
              <li className={Styles.loader}>
                <Loader message={this.props.item.loadingMessage} />
              </li>
            </When>
            <Otherwise>
              <For
                each="legend"
                index="i"
                of={this.props.item.legendUrls || []}
              >
                {this.renderLegend(legend, i)}
              </For>
            </Otherwise>
          </Choose>
        </div>
      </ul>
    );
  }
});

function makeAbsolute(url) {
  const uri = new URI(url);
  if (uri.protocol() !== "http" && uri.protocol() !== "https") {
    return url;
  } else {
    return uri.absoluteTo(window.location.href).toString();
  }
}

module.exports = Legend;
