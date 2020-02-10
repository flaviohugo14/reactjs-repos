import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MdFilterList, MdNavigateNext, MdNavigateBefore } from 'react-icons/md';

import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  IssueFilter,
  ContainerFilter,
  PageActions,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    filters: [
      { state: 'all', label: 'Todas', active: true },
      { state: 'open', label: 'Abertas', active: false },
      { state: 'closed', label: 'Fechadas', active: false },
    ],
    filterIndex: 0,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const { status } = this.state;

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: status,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      loading: false,
      issues: issues.data,
    });
  }

  loadIssues = async () => {
    const { match } = this.props;
    const { filters, filterIndex, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[filterIndex].state,
        per_page: 5,
        page,
      },
    });

    this.setState({ issues: response.data });
  };

  handleFilterClick = async filterIndex => {
    await this.setState({ filterIndex });
    this.loadIssues();
  };

  handlePage = async action => {
    const { page } = this.state;
    await this.setState({
      page: action === 'back' ? page - 1 : page + 1,
    });
    this.loadIssues();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      filters,
      filterIndex,
      page,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueList>
          <ContainerFilter>
            <MdFilterList size={20} color="#7159c1" />
            <IssueFilter active={filterIndex}>
              {filters.map((filter, index) => (
                <button
                  type="button"
                  key={filter.label}
                  onClick={() => this.handleFilterClick(index)}
                >
                  {filter.label}
                </button>
              ))}
            </IssueFilter>
          </ContainerFilter>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <PageActions>
          {page < 2 ? (
            <MdNavigateBefore size={30} color="#7159c1" disabled={page < 2} />
          ) : (
            <MdNavigateBefore
              size={30}
              color="#7159c1"
              onClick={() => this.handlePage('back')}
            />
          )}

          <span>Página {page}</span>
          <MdNavigateNext
            size={30}
            color="#7159c1"
            onClick={() => this.handlePage('next')}
          />
        </PageActions>
      </Container>
    );
  }
}
