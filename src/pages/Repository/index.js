import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList } from './styles';

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
    status: 'all',
    newStatus: '',
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

  handleStatus = async e => {
    this.setState({ newStatus: e.target.value });

    const { status, newStatus } = this.state;

    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    if (status !== newStatus) {
      this.setState({ status: newStatus });
      const issues = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state: newStatus,
          per_page: 5,
        },
      });

      this.setState({ issues: issues.data });
    }
  };

  render() {
    const { repository, issues, loading, status } = this.state;

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
        <select value={status} onChange={this.handleStatus}>
          <option value="all">Todas</option>
          <option value="closed">Fechadas</option>
          <option value="open">Abertas</option>
        </select>
        <IssueList>
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
      </Container>
    );
  }
}
